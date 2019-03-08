import { BrowserWindow, app, ipcMain } from 'electron';

import yargs from 'yargs';
import { setupTray } from './modules/tray';
import { startClef, initClefEvents } from './modules/clef';
import { initIPCEvents } from './modules/ipc';

const argv = yargs
  .usage('Usage: $0 [Cleftron options]')
  .option({
    clefbin: {
      alias: 'c',
      describe: 'Path to clef bin (optional)',
      requiresArg: true,
      nargs: 1,
      type: 'string'
    }
  })
  .help('h')
  .alias('h', 'help')
  .parse(process.argv.slice(1));

if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path')
    .join(__dirname, '/static')
    .replace(/\\/g, '\\\\');
}

let mainWindow;
let clef;

const winURL =
  process.env.NODE_ENV === 'development'
    ? `http://localhost:9080`
    : `file://${__dirname}/index.html`;

// Note: Vuex state in main process is read-only
global.vuexState = null;
ipcMain.on('vuex-state', (event, state) => {
  global.vuexState = state;
});

app.on('ready', function() {
  clef = startClef(argv);
  createWindow();
  initIPCEvents(clef, mainWindow);
  initClefEvents(clef, mainWindow);
  setupTray(mainWindow);
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

function createWindow() {
  mainWindow = new BrowserWindow({
    height: 1000,
    useContentSize: true,
    width: 563
  });

  mainWindow.loadURL(winURL);

  // if (process.env.NODE_ENV === 'development') {
  //   mainWindow.webContents.openDevTools();
  // }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  mainWindow.on('close', event => {
    if (!app.isQuiting) {
      event.preventDefault();
      event.sender.hide();
    }
  });
}
