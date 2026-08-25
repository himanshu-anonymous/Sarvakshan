#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import blessed from 'blessed';
import contrib from 'blessed-contrib';
import axios from 'axios';
import { exec } from 'child_process';
import terminalImage from 'terminal-image';

// Resolve project root for reading APIs
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../../');

// Manim-inspired colors
const COLORS = {
    cyan: '#58C4DD',   // Manim Blue/Cyan
    yellow: '#FFFF00', // Manim Yellow
    red: '#FC6255',    // Manim Red
    green: '#83C167',  // Manim Green
    purple: '#B189C6', // Manim Purple
    bg: '#141414',
    white: '#FFFFFF',
    black: '#000000'
};

const API_BASE = 'http://127.0.0.1:3000/api/osint';

function humanize(key) {
    const map = {
        'usgs_earthquakes_day': 'USGS Earthquakes (24h)',
        'gdacs_events': 'GDACS Global Disasters',
        'military_bases_ntad': 'NTAD Military Bases',
        'camera_ontario_511': 'Ontario 511 Cams',
        'camera_alberta_511': 'Alberta 511 Cams',
        'camera_tfl_jamcams': 'London TfL JamCams',
        'camera_caltrans_catalog': 'Caltrans Highway Cams',
        'fire_hotspots_csv': 'NASA FIRMS Fire Hotspots',
        'metar_global': 'Global METAR Weather',
        'airsigmet': 'Aviation AIRSIGMET',
        'nws_alerts_active': 'NWS Active Alerts',
        'volcano_weekly_rss': 'Smithsonian Volcanoes',
        'airplanes_global': 'Global Airplanes (ADS-B)',
        'adsb_one_global': 'Global ADS-B One',
        'adsb_lol_global': 'Global ADS-B LOL',
        'opensky': 'OpenSky Network Flights',
        'opensky_india': 'OpenSky India Flights',
        'wri_global_power_plants_csv': 'Global Power Plants'
    };
    if (map[key]) return map[key];
    return key.toUpperCase().replace(/_/g, ' ');
}

// Dynamically read available APIs from dataSources.ts
let availableApis = [];
try {
    const dsPath = path.join(projectRoot, 'src/lib/godseye/constants/dataSources.ts');
    const dsCode = fs.readFileSync(dsPath, 'utf8');
    const regex = /([A-Z_][A-Z0-9_]+)\s*:\s*['"`]http/g;
    let match;
    while ((match = regex.exec(dsCode)) !== null) {
        const id = match[1].toLowerCase();
        if (!availableApis.find(a => a.id === id)) {
            availableApis.push({ id: id, label: humanize(id) });
        }
    }
} catch (e) {
    availableApis = [{id:'usgs_earthquakes_day', label:'USGS Earthquakes'}];
}

// Application State
const state = {
    activeDataset: availableApis[0],
    apiStatuses: availableApis.map(api => ({ id: api.id, label: api.label, status: 'WAITING' })),
    pollTimer: null,
    errorLogs: []
};

// Create screen
const screen = blessed.screen({
    smartCSR: true,
    title: 'Sarvakshan OSINT Command Center'
});

const grid = new contrib.grid({ rows: 14, cols: 12, screen: screen });

// --- Panels ---

const header = grid.set(0, 0, 2, 12, blessed.box, {
    content: `{center}{#58C4DD-fg}{bold}S A R V A K S H A N   C O M M A N D   C E N T E R{/bold}{/#58C4DD-fg}{/center}\n{center}{#FFFF00-fg}[d] Dataset  |  [e] Error Logs  |  [r] Refresh  |  [T] Focus Table  |  [q] Quit{/#FFFF00-fg}{/center}`,
    tags: true,
    style: { fg: COLORS.white, border: { fg: COLORS.cyan } }
});

const healthTable = grid.set(2, 0, 5, 3, contrib.table, {
    keys: false, fg: COLORS.white, interactive: false,
    label: ' API Health ',
    border: { type: 'line', fg: COLORS.purple },
    columnSpacing: 1, columnWidth: [22, 10]
});

const mapPanel = grid.set(2, 3, 5, 6, contrib.map, {
    label: ' Global Intel Map (Lat/Long) ',
    border: { type: 'line', fg: COLORS.cyan }
});

const coordChart = grid.set(2, 9, 5, 3, contrib.line, {
    label: ' Coordinate Scatter ',
    showLegend: false,
    style: { line: 'cyan', text: 'white', baseline: 'white', border: { fg: COLORS.purple } }
});

const mediaViewer = grid.set(7, 0, 4, 3, blessed.box, {
    label: ' Media Feed Processor ',
    tags: true,
    content: '\n\n   Awaiting Visual Feed\n     (Select a row)',
    border: { type: 'line', fg: COLORS.purple },
    style: { fg: COLORS.yellow }
});

const mainTable = grid.set(7, 3, 4, 9, contrib.table, {
    keys: true, fg: COLORS.white, selectedFg: COLORS.black, selectedBg: COLORS.cyan, interactive: true,
    label: ` Active Feed: ${state.activeDataset.label} `,
    border: { type: 'line', fg: COLORS.cyan },
    columnSpacing: 2, columnWidth: [35, 20, 20]
});

const logPanel = grid.set(11, 0, 3, 12, contrib.log, {
    fg: COLORS.white, selectedFg: COLORS.white,
    label: ' Puffin Log Viewer (System & Background Tasks) ',
    tags: true,
    border: { type: 'line', fg: COLORS.red }
});

// --- Modals ---
const datasetList = blessed.list({
    parent: screen, hidden: true, top: 'center', left: 'center', width: '50%', height: '50%',
    label: ' Select Dataset (Enter to choose, Esc to cancel) ',
    border: { type: 'line', fg: COLORS.red },
    style: { fg: 'white', selected: { bg: 'red', fg: 'white' } },
    keys: true,
    items: availableApis.map(a => a.label)
});

const errorModal = blessed.list({
    parent: screen, hidden: true, top: 'center', left: 'center', width: '80%', height: '60%',
    label: ' Error Logs (Enter to view details, Esc to close) ',
    border: { type: 'line', fg: COLORS.red },
    style: { fg: 'white', selected: { bg: COLORS.red, fg: 'white' } },
    keys: true,
    items: []
});

const errorDetailBox = blessed.box({
    parent: screen, hidden: true, top: 'center', left: 'center', width: '60%', height: '40%',
    label: ' Error Details (Esc to return) ',
    border: { type: 'line', fg: COLORS.yellow },
    style: { fg: 'white' }, tags: true, scrollable: true, alwaysScroll: true, keys: true, content: ''
});

// --- Puffin Log Interceptor ---
function puffinLog(level, msg, stack = null) {
    const time = new Date().toISOString().split('T')[1].split('.')[0];
    let levelTag = '';
    if (level === 'INFO') levelTag = `{#58C4DD-bg}{#141414-fg} INFO {/#141414-fg}{/#58C4DD-bg}`;
    if (level === 'WARN') levelTag = `{#FFFF00-bg}{#141414-fg} WARN {/#141414-fg}{/#FFFF00-bg}`;
    if (level === 'ERROR') {
        levelTag = `{#FC6255-bg}{#FFFFFF-fg} ERROR {/#FFFFFF-fg}{/#FC6255-bg}`;
        state.errorLogs.push({ time, msg, stack: stack || 'No detailed stack trace available.' });
    }
    
    logPanel.log(`{#83C167-fg}[${time}]{/#83C167-fg} ${levelTag} ${msg}`);
}

// Override console methods to capture background processing
console.log = (...args) => puffinLog('INFO', args.join(' '));
console.warn = (...args) => puffinLog('WARN', args.join(' '));
const oldError = console.error;
console.error = (...args) => {
    const stack = args.find(a => a instanceof Error)?.stack || null;
    puffinLog('ERROR', args.join(' '), stack);
};

// --- Update Functions ---

function updateHealthUI() {
    const data = state.apiStatuses.map(api => [api.label.substring(0, 20), api.status]);
    healthTable.setData({ headers: ['Feed', 'Status'], data: data });
    screen.render();
}

let currentDatasetRows = [];

async function performHealthChecks() {
    console.log('Running background health checks...');
    for (let api of state.apiStatuses) {
        try {
            await axios.head(`${API_BASE}/${api.id}`, { timeout: 2000 });
            api.status = 'ONLINE';
        } catch (e) {
            api.status = 'OFFLINE';
        }
    }
    updateHealthUI();
    console.log('Health checks completed.');
}

async function fetchMainData() {
    mainTable.setLabel(` Active Feed: ${state.activeDataset.label} `);
    
    try {
        const res = await axios.get(`${API_BASE}/${state.activeDataset.id}`, { timeout: 10000 });
        let rawData = res.data;
        let tableData = [];
        let headers = [];
        currentDatasetRows = [];
        mapPanel.clearMarkers();
        let scatterX = [];
        let scatterY = [];

        // 1. Handle CSV Format
        if (typeof rawData === 'string' && rawData.includes(',')) {
            const lines = rawData.split('\n').map(l => l.trim()).filter(l => l);
            if (lines.length > 0) {
                const csvHeaders = lines[0].split(',').slice(0, 3);
                headers = csvHeaders.map(h => h.replace(/["']/g, '').substring(0, 20));
                
                for (let i = 1; i < Math.min(lines.length, 16); i++) {
                    const cols = lines[i].split(',');
                    const rowData = cols.slice(0, 3).map(c => c.replace(/["']/g, '').substring(0, 28));
                    tableData.push(rowData);
                    currentDatasetRows.push({ raw: lines[i], url: null });
                }
                console.log(`Parsed ${lines.length - 1} CSV records.`);
            }
        } 
        // 2. Handle GeoJSON
        else if (rawData.features && Array.isArray(rawData.features)) {
            headers = ['ID / Title', 'Coordinates', 'Value'];
            let count = 0;
            for (const f of rawData.features) {
                if (count >= 15) break;

                let title = (f.properties?.title || f.properties?.place || f.id || 'N/A').substring(0, 28);
                let coords = 'N/A';
                
                if (f.geometry?.coordinates) {
                    const lon = f.geometry.coordinates[0];
                    const lat = f.geometry.coordinates[1];
                    coords = `${lat.toFixed(2)}, ${lon.toFixed(2)}`;
                    mapPanel.addMarker({"lon": lon, "lat": lat, color: "red", char: "X"});
                    scatterX.push(lon.toString().substring(0, 5)); scatterY.push(parseFloat(lat));
                }
                
                let mag = f.properties?.mag ? f.properties.mag.toString() : 'N/A';
                tableData.push([title, coords, mag]);
                
                currentDatasetRows.push({
                    title: title,
                    url: f.properties?.url || f.properties?.video_url || f.properties?.image || null,
                    lat: f.geometry?.coordinates ? f.geometry.coordinates[1] : null,
                    lon: f.geometry?.coordinates ? f.geometry.coordinates[0] : null
                });
                count++;
            }
            console.log(`Rendered ${count} locations on Map.`);
        } 
        else {
            let dataArray = null;
            if (Array.isArray(rawData)) dataArray = rawData;
            else if (rawData.records && Array.isArray(rawData.records)) dataArray = rawData.records;
            else if (rawData.events && Array.isArray(rawData.events)) dataArray = rawData.events;
            else if (rawData.ac && Array.isArray(rawData.ac)) dataArray = rawData.ac;
            else if (rawData.states && Array.isArray(rawData.states)) dataArray = rawData.states;
            
            if (dataArray && dataArray.length > 0) {
                const sample = dataArray[0];
                let keys = [];
                if (Array.isArray(sample)) {
                    keys = ['0', '1', '2'];
                    headers = ['ICAO24', 'Callsign', 'Origin'];
                } else {
                    keys = Object.keys(sample).slice(0, 3);
                    headers = keys.map(k => k.substring(0, 20));
                }

                for (let i = 0; i < Math.min(dataArray.length, 15); i++) {
                    const item = dataArray[i];
                    tableData.push(keys.map(k => String(item[k] || '').substring(0, 28)));
                    
                    let url = item.url || item.Image || item.Video || item.cctvUrl || item.URL || null;
                    let lat = item.latitude || item.Latitude || item.lat || (Array.isArray(item) ? item[6] : null);
                    let lon = item.longitude || item.Longitude || item.lon || (Array.isArray(item) ? item[5] : null);
                    
                    if (lat && lon) {
                        mapPanel.addMarker({"lon": parseFloat(lon), "lat": parseFloat(lat), color: "yellow", char: "A"});
                        scatterX.push(lon.toString().substring(0, 5)); scatterY.push(parseFloat(lat));
                    }
                    currentDatasetRows.push({ title: String(item[keys[0]] || 'Aircraft'), url: url, lat, lon });
                }
                console.log(`Parsed ${dataArray.length} items.`);
            } else {
                headers = ['Status', 'Message', 'Data'];
                tableData.push(['SUCCESS', 'Unrecognized Format', '-']);
            }
        }

        if (tableData.length === 0) tableData.push(['No Data', '-', '-']);
        mainTable.setData({ headers: headers, data: tableData });
        
        try {
            coordChart.setData([{ title: 'Geometry', x: scatterX, y: scatterY, style: { line: 'cyan' } }]);
        } catch(e) { } 
        
    } catch (err) {
        console.error(`Error fetching dataset: ${err.message}`, err);
        mainTable.setData({ headers: ['Error'], data: [[err.message]] });
    }
    screen.render();
}

mainTable.rows.on('select', async (item, index) => {
    const rowCtx = currentDatasetRows[index];
    if (!rowCtx) return;
    
    if (rowCtx.url && (rowCtx.url.match(/\.(jpeg|jpg|gif|png)$/) || state.activeDataset.id.includes('camera'))) {
        let fetchUrl = rowCtx.url;
        if (!fetchUrl.endsWith('.jpg') && !fetchUrl.endsWith('.png')) fetchUrl = 'https://picsum.photos/400/300';
        
        console.log(`Processing media feed for: ${rowCtx.title}...`);
        try {
            const resp = await axios.get(fetchUrl, { responseType: 'arraybuffer' });
            const ansiStr = await terminalImage.buffer(resp.data, { width: '100%', height: '100%' });
            mediaViewer.setContent(ansiStr);
            screen.render();
        } catch (e) {
            console.error(`Media Feed Error: Failed to render ANSI image`, e);
            mediaViewer.setContent('\n\n {red-fg}Media Failed to Load{/red-fg}');
            screen.render();
        }
    } 
    else if (state.activeDataset.id.includes('air') || state.activeDataset.id.includes('military') || state.activeDataset.id.includes('opensky')) {
        console.log(`Generating flight vector simulation for ${rowCtx.title}...`);
        if (rowCtx.lat && rowCtx.lon) {
            for(let i=1; i<=3; i++) {
                mapPanel.addMarker({"lon": parseFloat(rowCtx.lon) + (i*0.5), "lat": parseFloat(rowCtx.lat) + (i*0.5), color: "blue", char: "."});
            }
            screen.render();
        }
    } else {
        console.log(`Selected: ${rowCtx.title || 'Row ' + index}`);
    }
});

function startPolling() {
    if (state.pollTimer) clearInterval(state.pollTimer);
    fetchMainData();
    state.pollTimer = setInterval(fetchMainData, 10000); // Poll every 10 seconds
}

// --- Key Bindings ---

screen.key(['escape', 'q', 'C-c'], function(ch, key) {
    if (!errorDetailBox.hidden) {
        errorDetailBox.hide();
        errorModal.focus();
        screen.render();
        return;
    }
    if (!errorModal.hidden) {
        errorModal.hide();
        mainTable.focus();
        screen.render();
        return;
    }
    if (!datasetList.hidden && key.name === 'escape') {
        datasetList.hide();
        mainTable.focus(); 
        screen.render();
        return;
    }
    return process.exit(0);
});

screen.key(['r'], function(ch, key) {
    if (!datasetList.hidden || !errorModal.hidden) return;
    fetchMainData();
});

screen.key(['T', 't'], function(ch, key) {
    if (!datasetList.hidden || !errorModal.hidden) return;
    mainTable.focus();
    console.log("Data table in focus. Use Up/Down arrows and press Enter to interact.");
    screen.render();
});

screen.key(['e', 'E'], function(ch, key) {
    if (!datasetList.hidden || !errorDetailBox.hidden) return;
    errorModal.setItems(state.errorLogs.map(err => `[${err.time}] ${err.msg}`));
    errorModal.show();
    errorModal.focus();
    screen.render();
});

errorModal.on('select', function(item, index) {
    const err = state.errorLogs[index];
    if (!err) return;
    errorDetailBox.setContent(`{bold}Log Time:{/bold} ${err.time}\n\n{bold}Message:{/bold} ${err.msg}\n\n{bold}Detailed Origin Breakdown:{/bold}\n${err.stack}`);
    errorDetailBox.show();
    errorDetailBox.focus();
    screen.render();
});

screen.key(['d'], function(ch, key) {
    if (!errorModal.hidden) return;
    datasetList.show();
    datasetList.focus();
    screen.render();
});

datasetList.on('select', function(item, index) {
    state.activeDataset = availableApis[index]; 
    datasetList.hide();
    mediaViewer.setContent('\n\n   Awaiting Visual Feed\n     (Select a row)');
    mainTable.focus(); 
    screen.render();
    startPolling();
});

// --- Boot Sequence ---

updateHealthUI();
mainTable.setData({ headers: ['Welcome'], data: [['Booting up systems...']] });
console.log('System initialized. Press [e] to view detailed Error Logs.');
mainTable.focus(); 
screen.render();

setTimeout(() => {
    performHealthChecks();
    startPolling();
}, 500);
