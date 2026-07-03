import fs from "node:fs/promises";
import path from "node:path";
import { execSync } from "node:child_process";

const pluginName = process.argv[2];
if (!pluginName) {
    console.error("❌ Usage: node scripts/migrate-plugin.mjs <plugin-name>");
    console.error("   Example: node scripts/migrate-plugin.mjs gps-jamming");
    process.exit(1);
}

const CWD = process.cwd();
const LOCAL_PLUGINS_DIR = path.join(CWD, "local-plugins");
const PACKAGES_DIR = path.join(CWD, "packages");
const EXTERNAL_PLUGINS_DIR = path.resolve(CWD, "../worldwideview-plugins/packages");

const pluginDirName = `wwv-plugin-${pluginName}`;
const destPluginPath = path.join(LOCAL_PLUGINS_DIR, pluginDirName);

async function exists(p) {
    try {
        await fs.access(p);
        return true;
    } catch {
        return false;
    }
}

async function run() {
    console.log(`🚀 Starting migration for plugin: ${pluginName}`);

    // 1. Find and copy the frontend plugin
    let sourcePluginPath = null;
    if (await exists(path.join(PACKAGES_DIR, pluginDirName))) {
        sourcePluginPath = path.join(PACKAGES_DIR, pluginDirName);
    } else if (await exists(path.join(EXTERNAL_PLUGINS_DIR, pluginDirName))) {
        sourcePluginPath = path.join(EXTERNAL_PLUGINS_DIR, pluginDirName);
    }

    if (!sourcePluginPath) {
        console.warn(`⚠️ Could not find frontend plugin ${pluginDirName} in packages/ or ../worldwideview-plugins/packages/. Skipping frontend copy.`);
    } else {
        if (!(await exists(destPluginPath))) {
            console.log(`📁 Copying frontend plugin from ${sourcePluginPath} to ${destPluginPath}...`);
            await fs.cp(sourcePluginPath, destPluginPath, { 
                recursive: true, 
                filter: (src) => !src.includes('node_modules') && !src.includes('dist')
            });
        } else {
            console.log(`📁 Frontend plugin already exists at ${destPluginPath}. Proceeding with modifications...`);
        }

        // Clean up node_modules
        const nmPath = path.join(destPluginPath, "node_modules");
        if (await exists(nmPath)) {
            console.log(`🗑️ Removing node_modules in ${destPluginPath}...`);
            await fs.rm(nmPath, { recursive: true, force: true });
        }

        // 2. Update package.json
        const pkgPath = path.join(destPluginPath, "package.json");
        if (await exists(pkgPath)) {
            console.log(`📝 Updating package.json for frontend plugin...`);
            const pkgRaw = await fs.readFile(pkgPath, "utf-8");
            const pkg = JSON.parse(pkgRaw);

            pkg.type = "module";
            pkg.main = "dist/frontend.mjs";
            pkg.module = "dist/frontend.mjs";

            if (!pkg.peerDependencies) pkg.peerDependencies = {};
            pkg.peerDependencies["@worldwideview/wwv-plugin-sdk"] = "workspace:*";

            // Add scripts if missing
            if (!pkg.scripts) pkg.scripts = {};
            pkg.scripts.build = "vite build";

            await fs.writeFile(pkgPath, JSON.stringify(pkg, null, 2));
        }

        // 3. Ensure vite.config.ts
        const vitePath = path.join(destPluginPath, "vite.config.ts");
        if (!(await exists(vitePath))) {
            console.log(`📝 Creating vite.config.ts...`);
            await fs.writeFile(vitePath, `import { defineConfig } from "vite";
import { wwvPluginGlobals } from "@worldwideview/wwv-plugin-sdk";

export default defineConfig({
  plugins: [wwvPluginGlobals()],
  build: {
    lib: {
      entry: "src/index.tsx",
      formats: ["es"],
      fileName: () => "frontend.mjs",
    },
    minify: true,
    sourcemap: false,
  },
});
`);
        }

        // 4. Refactor index.ts or index.tsx to use getEngineUrl()
        for (const ext of ["ts", "tsx"]) {
            const indexPath = path.join(destPluginPath, "src", `index.${ext}`);
            if (await exists(indexPath)) {
                console.log(`🔧 Refactoring frontend routing in src/index.${ext}...`);
                let content = await fs.readFile(indexPath, "utf-8");
                
                // Replace hardcoded engine base block (various patterns)
                const legacyPattern1 = /let engineBase = 'https:\/\/dataengine\.worldwideview\.dev';[\s\S]*?(?=const res = await globalThis\.fetch)/m;
                if (legacyPattern1.test(content)) {
                    content = content.replace(legacyPattern1, `if (!this.context) throw new Error("Plugin context not initialized");\n            const engineUrl = this.context.getEngineUrl();\n            const engineBase = engineUrl.replace(/\\/stream$/, '').replace(/^ws/, "http");\n            `);
                }

                // Replace `const baseUrl = this.context?.apiBaseUrl || "https://dataengine.worldwideview.dev";`
                const legacyPattern2 = /const baseUrl = this\.context\?\.apiBaseUrl \|\| ["']https:\/\/dataengine\.worldwideview\.dev["'];/g;
                if (legacyPattern2.test(content)) {
                    content = content.replace(legacyPattern2, `if (!this.context) throw new Error("Plugin context not initialized");\n        const baseUrl = this.context.getEngineUrl().replace(/\\/stream$/, '').replace(/^ws/, "http");`);
                }

                await fs.writeFile(indexPath, content);
            }
        }
    }

    // 5. Update Backend Seeder
    // Seeders could be in community or private. Check both.
    const seedersBasePath = path.join(CWD, "local-seeders");
    let seederPath = null;
    
    for (const tier of ["community", "private"]) {
        const potentialPath = path.join(seedersBasePath, tier, "packages", pluginName);
        if (await exists(potentialPath)) {
            seederPath = potentialPath;
            break;
        }
    }

    // fallback to check mapping
    if (!seederPath) {
        // e.g. gps-jamming might map to gpsjam
        const potentialPath = path.join(seedersBasePath, "community", "packages", pluginName.replace('-jamming', 'jam'));
        if (await exists(potentialPath)) {
            seederPath = potentialPath;
        }
    }

    if (seederPath) {
        console.log(`📁 Found backend seeder at ${seederPath}. Updating...`);
        const pkgPath = path.join(seederPath, "package.json");
        if (await exists(pkgPath)) {
            const pkgRaw = await fs.readFile(pkgPath, "utf-8");
            const pkg = JSON.parse(pkgRaw);

            pkg.main = "dist/index.mjs";
            if (pkg.scripts && pkg.scripts.build) {
                pkg.scripts.build = "tsup src/index.ts --format esm --target es2022 --clean --outDir dist";
            }
            await fs.writeFile(pkgPath, JSON.stringify(pkg, null, 2));
        }

        const seederIndex = path.join(seederPath, "src", "index.ts");
        if (await exists(seederIndex)) {
            let content = await fs.readFile(seederIndex, "utf-8");
            
            // Fix fileURLToPath usage
            if (content.includes("fileURLToPath(import.meta.url)")) {
                console.log(`🔧 Refactoring fileURLToPath to use SEEDERS_DIR...`);
                // This is a naive replacement, but works for most standard cases
                content = content.replace(
                    /const __dirname = path\.dirname\(fileURLToPath\(import\.meta\.url\)\);\n\s*const (\w+) = path\.join\(__dirname, (.*?)\);/g,
                    `const $1 = process.env.SEEDERS_DIR ? path.join(process.env.SEEDERS_DIR, "community", "packages", "${pluginName}", $2) : path.resolve(process.cwd(), $2);`
                );
                await fs.writeFile(seederIndex, content);
            }
        }
    } else {
        console.warn(`⚠️ Could not find backend seeder for ${pluginName}. Skipping seeder update.`);
    }

    // 6. Register in defaultPlugins.ts
    const defaultsPath = path.join(CWD, "src", "lib", "marketplace", "defaultPlugins.ts");
    if (await exists(defaultsPath)) {
        let content = await fs.readFile(defaultsPath, "utf-8");
        if (!content.includes(`"${pluginName}"`)) {
            console.log(`📝 Adding ${pluginName} to defaultPlugins.ts...`);
            content = content.replace(/\] as const;/, `    "${pluginName}",\n] as const;`);
            await fs.writeFile(defaultsPath, content);
        } else {
            console.log(`✅ ${pluginName} is already in defaultPlugins.ts.`);
        }
    }

    console.log(`✅ Migration automated script finished for ${pluginName}.`);
    console.log(`💡 Remember to run 'pnpm install' and 'pnpm build' in the plugin directories to verify.`);
}

run().catch(console.error);
