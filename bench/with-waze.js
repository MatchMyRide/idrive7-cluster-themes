'use strict';
/**
 * with-waze.js - the bench with fake-waze.js beside it, in one command (any OS):
 *
 *   node bench/with-waze.js [app_id]      then open http://localhost:8078
 *
 * Starts fake-waze.js (bench/.data/waze, state "showing") and bench/server.js with WAZE_STATUS / WAZE_CTL pointed at
 * it, so "Show Waze map inside the theme" opens the theme's map window. The fake draws no map: the window shows
 * the bench's backdrop (tick "stock cluster backdrop"). Ctrl+C stops both. Bench only.
 */
const path = require('path');
const { spawn } = require('child_process');
const dir = path.join(__dirname, '.data', 'waze');
const ctl = process.platform === 'win32' ? '\\\\.\\pipe\\fake-waze-ctl' : path.join(dir, 'ctl.sock');
const waze = spawn(process.execPath, [path.join(__dirname, 'fake-waze.js'), dir, '--state', 'showing'], { stdio: 'inherit' });
const env = Object.assign({}, process.env, { WAZE_STATUS: path.join(dir, 'status.json'), WAZE_CTL: ctl });
const bench = spawn(process.execPath, [path.join(__dirname, 'server.js')].concat(process.argv.slice(2)), { stdio: 'inherit', env });
const stop = () => { try { waze.kill(); } catch (e) { /* gone */ } try { bench.kill(); } catch (e) { /* gone */ } };
bench.on('exit', (code) => { stop(); process.exit(code || 0); });
process.on('SIGINT', () => { stop(); process.exit(0); });
