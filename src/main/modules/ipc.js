import { ipcMain } from 'electron';
import log from 'electron-log';
import { validateAndSendToClef } from './clef';

export function initIPCEvents(clef, mainWindow) {
  // From the landing page, we send 'channelsConfigured' when
  // the receivers are configured and ready to receive data
  ipcMain.once('channelsConfigured', () => {
    clef.stderr.on('data', data => {
      mainWindow.webContents.send('stderr', data);
      log.info(String(data));
    });
  });

  // Send response to clef
  ipcMain.on('response', (event, message) => {
    validateAndSendToClef(clef, message, mainWindow);
  });
}
