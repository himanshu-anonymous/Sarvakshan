/*
 * Copyright (c) 2026 Aditya and Mankshu. All rights reserved.
 * This code is the exclusive property of Aditya and Mankshu.
 */

import { useStore } from "@/core/state/store";
import { sectionHeaderStyle, inputGroupStyle, labelStyle, inputStyle, checkboxStyle } from "./sharedStyles";

export function CacheTab() {
    const dataConfig = useStore((s) => s.dataConfig);
    const updateDataConfig = useStore((s) => s.updateDataConfig);

    return (
        <div style={{ marginBottom: "var(--space-lg)" }}>
            <div style={sectionHeaderStyle}>Cache & Limits</div>

            <div style={inputGroupStyle}>
                <label style={labelStyle}>Enable Cache</label>
                <input
                    type="checkbox"
                    checked={dataConfig.cacheEnabled}
                    onChange={(e) => updateDataConfig({ cacheEnabled: e.target.checked })}
                    style={checkboxStyle}
                />
            </div>

            <div style={inputGroupStyle}>
                <label style={labelStyle}>Cache Max Age (ms)</label>
                <input
                    type="number"
                    value={dataConfig.cacheMaxAge}
                    onChange={(e) => updateDataConfig({ cacheMaxAge: parseInt(e.target.value) || 0 })}
                    style={inputStyle}
                />
            </div>

            <div style={inputGroupStyle}>
                <label style={labelStyle}>Max Concurrent Req</label>
                <input
                    type="number"
                    value={dataConfig.maxConcurrentRequests}
                    onChange={(e) => updateDataConfig({ maxConcurrentRequests: parseInt(e.target.value) || 0 })}
                    style={inputStyle}
                />
            </div>

            <div style={inputGroupStyle}>
                <label style={labelStyle}>Retry Attempts</label>
                <input
                    type="number"
                    value={dataConfig.retryAttempts}
                    onChange={(e) => updateDataConfig({ retryAttempts: parseInt(e.target.value) || 0 })}
                    style={inputStyle}
                />
            </div>
        </div>
    );
}
