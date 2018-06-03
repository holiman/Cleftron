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

import path from 'path';
import StringDecoder from 'string_decoder';
import jsonrpc from 'jsonrpc-lite';
import { spawn } from 'cross-spawn';
import yargs from 'yargs';
import log from 'electron-log';
import { validateTx } from '../lib/ethValidators';

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

app.on('ready', function() {
  startClef();
  createWindow();
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

// Note: Vuex state in main process is read-only
global.vuexState = null;
ipcMain.on('vuex-state', (event, state) => {
  global.vuexState = state;
});

function createWindow() {
  mainWindow = new BrowserWindow({
    height: 1000,
    useContentSize: true,
    width: 563
  });

  mainWindow.loadURL(winURL);

  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  setupTray();

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  mainWindow.on('close', event => {
    if (!app.isQuiting) {
      event.preventDefault();
      event.sender.hide();
    }
  });

  const sendClef = function(data) {
    log.info('send clef -> ' + data);
    clef.stdin.write(data);
    clef.stdin.write('\n');
  };

  ipcMain.on('response', (event, message) => {
    // If approving tx...
    if (message.result.approved && message.result.transaction) {
      // Validate tx
      const errors = validateTx(message.result.transaction);
      if (errors.length > 0) {
        const errorMessage = `Transaction is invalid: ${errors.join(', ')}`;
        log.error(errorMessage);
        note(errorMessage);
        return;
      }

      // Notify user of changes to original tx params
      const changed = checkEditedTx(message.id);
      if (changed.length > 0) {
        dialog.showMessageBox(
          {
            type: 'question',
            message: `Please note your transaction has been edited: ${changed.join(
              ', '
            )}`,
            buttons: [
              'Cancel transaction',
              'This looks OK. Approve transaction'
            ]
          },
          response => {
            if (response === 0) {
              log.info('Edited transaction cancelled');
            } else if (response === 1) {
              log.info('Edited transaction confirmed');
              mainWindow.webContents.send('message', message);
              sendClef(message);
            }
          }
        );
        return;
      }
    }

    mainWindow.webContents.send('message', message);
    sendClef(message);
  });

  // From the landing page, we send 'channelsConfigured' when
  // the receivers are configured and ready to receive data
  ipcMain.once('channelsConfigured', () => {
    clef.stderr.on('data', data => {
      mainWindow.webContents.send('stderr', data);
      log.info(String(data));
    });
  });

  clef.stdout.on('data', data => {
    log.info(data.toString());

    const rpc = jsonrpc.parse(decoder.end(data));

    if (rpc.type !== 'request') {
      log.error('Non-request rpc:' + rpc);
      return;
    }

    let payload = rpc.payload;
    let handler = clefHandlers[payload.method];

    if (handler) {
      note(handler.msg(payload));
      if (handler.ui) {
        mainWindow.webContents.send('ApprovalRequired', payload);
      } else {
        // ShowInfo, ShowError, OnSignerStartup, OnApprovedTx
        sendClef(JSON.stringify(jsonrpc.success(payload.id, {})));
      }
    } else {
      log.error('Missing handler for method ' + payload.method);
    }
  });

  clef.on('exit', code => {
    mainWindow.webContents.send('message', `clef exited with code ${code}`);
    throw code;
  });
}

const clefHandlers = {
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
    log.error(error);
    throw error;
  }

  notifyClefSha256(clefpath);
}

function notifyClefSha256(clefpath) {
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

// Set up the systray icon
function setupTray() {
  const iconPath = path.join(__static, 'blu-eth-48x48.png');
  let tray = new Tray(nativeImage.createFromPath(iconPath));

  const menu = Menu.buildFromTemplate([
    {
      label: 'Open',
      click: () => {
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

function checkEditedTx(id) {
  const task = global.vuexState.tasks[id];
  const originalTx = task.originalObj.params[0].transaction;
  const newTx = task.obj.params[0].transaction;
  const txFields = ['from', 'to', 'value', 'nonce', 'gas', 'gasPrice', 'data'];
  let changed = [];
  for (const field in txFields) {
    if (originalTx[field] !== newTx[field]) {
      changed.push(
        `${field} changed from ${originalTx[field]} to ${newTx[field]}`
      );
    }
  }
  return changed;
}
