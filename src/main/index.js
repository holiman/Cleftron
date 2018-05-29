import {
  Notification,
  Menu,
  BrowserWindow,
  Tray,
  app,
  nativeImage,
  ipcMain,
  dialog
} from 'electron';

import fs from 'fs';
import path from 'path';
import StringDecoder from 'string_decoder';
import jsonrpc from 'jsonrpc-lite';
import { spawn } from 'cross-spawn';
import yargs from 'yargs';

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

const decoder = new StringDecoder.StringDecoder('utf8');

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

// Set up the systray icon
function setupTray() {
  const iconPath = path.join(__static, 'blu-eth-48x48.png');
  let tray = new Tray(nativeImage.createFromPath(iconPath));

  const menu = Menu.buildFromTemplate([
    {
      label: 'Open',
      click: (item, window, event) => {
        mainWindow.show();
      }
    },
    { type: 'separator' },
    {
      label: 'Exit',
      click: () => {
        app.isQuiting = true;
        app.quit();
      }
    }
  ]);
  tray.setContextMenu(menu);
  tray.on('click', () => {
    mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
  });
}

// Display a notification to the user
function note(text, surpressOnClick) {
  let notify = new Notification({ title: 'Cleftron', body: text });
  notify.show();
  if (surpressOnClick) {
    return;
  }
  notify.on('click', () => {
    mainWindow.show();
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    height: 1000,
    useContentSize: true,
    width: 563
  });

  mainWindow.loadURL(winURL);
  //mainWindow.webContents.openDevTools()
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
  mainWindow.on('show', () => {});
  mainWindow.on('hide', () => {});
  setupTray();

  mainWindow.on('close', e => {
    if (!app.isQuiting) {
      e.preventDefault();
      e.sender.hide();
    }
  });
  var send = function(data) {
    console.log('->' + data);
    clef.stdin.write(data);
    clef.stdin.write('\n');
  };
  ipcMain.on('response', (e, m) => {
    mainWindow.webContents.send('message', m);
    send(m);
  });
  // From the landing page, we send 'channelsConfigured' when
  // the receivers are configured, and ready to receive data
  ipcMain.once('channelsConfigured', () => {
    clef.stderr.on('data', data => {
      mainWindow.webContents.send('stderr', data);
      console.log(String(data));
    });
  });
  let handlers = {
    ApproveTx: {
      msg: () => 'Transaction Signing is awaiting review.',
      ui: true
    },
    ApproveExport: {
      msg: () => 'Account Export is awaiting review.',
      ui: true
    },
    ApproveImport: {
      msg: () => 'Account Import is awaiting review.',
      ui: true
    },
    ApproveSignData: {
      msg: () => 'Message signing is awaiting review.',
      ui: true
    },
    ApproveListing: {
      msg: () => 'Account listing is awaiting review.',
      ui: true
    },
    ApproveNewAccount: {
      msg: () => 'New account request is awaiting review.',
      ui: true
    },
    // These ones do not have a separate UI
    ShowInfo: { msg: data => data.params[0].text },
    ShowError: { msg: data => data.params[0].text },
    OnApprovedTx: { msg: data => 'Signed ' + data.params[0].tx.hash },
    OnSignerStartup: {
      msg: data =>
        'Clef is up. Web: ' +
        data.params[0].info.extapi_http +
        ' IPC:' +
        data.params[0].info.extapi_ipc
    }
  };
  clef.stdout.on('data', data => {
    console.log(data.toString());
    let rpc = jsonrpc.parse(decoder.end(data));
    if (rpc.type != 'request') {
      console.log('wtf? ' + rpc);
      return;
    }
    let payload = rpc.payload;
    let handler = handlers[payload.method];
    if (handler) {
      note(handler.msg(payload));
      if (handler.ui) {
        mainWindow.webContents.send('ApprovalRequired', payload);
      } else {
        // ShowInfo, ShowError, OnSignerStartup, OnApprovedTx
        send(JSON.stringify(jsonrpc.success(payload.id, {})));
      }
      return;
    }
    console.log('Missing handler for method ' + payload.method);
    return;
  });

  clef.on('exit', code => {
    throw code;
    mainWindow.webContents.send('message', `Child exited with code ${code}`);
  });
}

app.on('ready', function() {
  startClef();
  createWindow();
});

function startClef() {
  let clefpath;

  if (argv.clefbin) {
    clefpath = argv.clefbin;
  } else {
    clefpath = dialog.showOpenDialog({
      title: 'Select Clef Binary',
      filters: [
        { name: 'Application', extensions: ['exe', 'bin', 'app'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    })[0];
  }

  try {
    clef = spawn(clefpath, [
      '--rpc',
      '--4bytedb',
      path.dirname(clefpath) + '/4byte.json',
      '--ipcdisable',
      '--stdio-ui'
    ]);
  } catch (error) {
    console.log(error);
    throw error;
  }

  let fd = require('fs').createReadStream(clefpath);
  let hash = require('crypto').createHash('sha256');
  hash.setEncoding('hex');
  fd.on('end', function() {
    hash.end();
    const notify = new Notification({
      title: 'Binary Sha256',
      body: hash.read(),
      silent: true
    });
    notify.show();
  });
  fd.pipe(hash);
}

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
