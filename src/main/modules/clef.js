import { app, dialog } from 'electron';
import { spawn } from 'cross-spawn';
import log from 'electron-log';
import path from 'path';
import jsonrpc from 'jsonrpc-lite';
import StringDecoder from 'string_decoder';
import { validateTx } from '../../lib/validators';
import { notify } from './util';

const decoder = new StringDecoder.StringDecoder('utf8');

export function startClef(argv) {
  let clef;
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
      '--stdio-ui',
      '--advanced'
    ]);
  } catch (error) {
    log.error(error);
    throw error;
  }

  confirmClefSha256(clefpath);

  return clef;
}

function confirmClefSha256(clefpath) {
  let fd = require('fs').createReadStream(clefpath);
  let hash = require('crypto').createHash('sha256');
  hash.setEncoding('hex');
  fd.on('end', function() {
    hash.end();
    dialog.showMessageBox(
      {
        type: 'info',
        message: `The clef binary has sha256-sum: ${hash.read()}`,
        buttons: ['Cancel', 'Ok']
      },
      response => {
        if (response === 0) {
          log.warn('Cancelled sha256-sum confirm dialog. Quitting app.');
          app.quit();
        }
      }
    );
  });
  fd.pipe(hash);
}

function sendClef(clef, data, mainWindow) {
  const message = JSON.stringify(data);
  clef.stdin.write(message);
  clef.stdin.write('\n');
  mainWindow.webContents.send('message', message);
  if (process.env.NODE_ENV === 'development') {
    log.info('[dev] send clef -> ' + data);
  } else {
    log.info('Message sent to clef');
  }
}

export function initClefEvents(clef, mainWindow) {
  clef.stdout.on('data', data => {
    log.info(data.toString());

    const rpc = jsonrpc.parse(decoder.end(data));

    if (rpc.type !== 'request') {
      log.error('Non-request rpc: ' + rpc);
      return;
    }

    let payload = rpc.payload;
    let handler = clefHandlers[payload.method];

    if (handler) {
      notify(mainWindow, handler.msg(payload));
      if (handler.ui) {
        mainWindow.webContents.send('ApprovalRequired', payload);
      } else {
        // ui_ShowInfo, ui_ShowError, ui_OnSignerStartup, ui_OnApprovedTx, ui_onUserInputReqiored
        // TODO, display this 'immediately'
        // In the case of user input required, we need to send a response,
        // but for notifications, there's no need
        if (payload.id) {
          sendClef(clef, jsonrpc.success(payload.id, {}), mainWindow);
        }
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
  ui_approveTx: {
    msg: () => 'Transaction Signing is awaiting review.',
    ui: true
  },
  ui_approveSignData: {
    msg: () => 'Message signing is awaiting review.',
    ui: true
  },
  ui_approveListing: {
    msg: () => 'Account listing is awaiting review.',
    ui: true
  },
  ui_approveNewAccount: {
    msg: () => 'New account request is awaiting review.',
    ui: true
  },
  // These ones do not have a separate UI
  ui_showInfo: { msg: data => data.params[0].text },
  ui_showError: { msg: data => data.params[0].text },
  ui_onApprovedTx: { msg: data => 'Signed ' + data.params[0].tx.hash },
  ui_onSignerStartup: {
    msg: data =>
      'Clef is up. Web: ' +
      data.params[0].info.extapi_http +
      ' IPC:' +
      data.params[0].info.extapi_ipc
  },
  ui_onInputRequired: {
    msg: data => 'Input required:' + data.params[0].text
  }
};
// validateAndSendToClef returns true if all went well,
// false if errors occurred and message was not sent
export function validateAndSendToClef(clef, message, mainWindow) {
  const data = JSON.parse(message);

  // If tx: validate and notify of any changed values
  if (data && data.result && data.result.transaction && data.result.approved) {
    // Validate tx
    const errors = validateTx(data.result.transaction);
    if (errors.length > 0) {
      const errorMessage = `Transaction is invalid: ${errors.join(', ')}`;
      log.error(errorMessage);
      dialog.showErrorBox('Error', errorMessage);
      return false;
    }

    // Notify user of changes to original tx params
    const changed = checkEditedTx(data.id);
    if (changed.length > 0) {
      dialog.showMessageBox(
        {
          type: 'question',
          message: `Please note your transaction has been edited: ${changed.join(
            ', '
          )}`,
          buttons: ['Cancel transaction', 'This looks OK. Approve transaction']
        },
        response => {
          if (response === 0) {
            log.info('Edited transaction cancelled');
          } else if (response === 1) {
            log.info('Edited transaction confirmed');
            sendClef(clef, data, mainWindow);
          }
        }
      );
      return true;
    }
  }

  sendClef(clef, data, mainWindow);
}

function checkEditedTx(id) {
  const task = global.vuexState.tasks[id];

  if (!task) {
    const errorMessage = `No task with id ${id} found`;
    log.error(errorMessage);
    throw errorMessage;
  }

  const originalTx = JSON.parse(task.strData).params[0].transaction;
  const newTx = task.obj.params[0].transaction;
  const txFields = ['from', 'to', 'value', 'nonce', 'gas', 'gasPrice', 'data'];
  let changed = [];

  txFields.forEach(field => {
    if (originalTx[field] !== newTx[field]) {
      const capitalizedField = field[0].toUpperCase() + field.slice(1);
      changed.push(
        `${capitalizedField} changed from ${originalTx[field]} to ${
          newTx[field]
        }`
      );
    }
  });

  return changed;
}
