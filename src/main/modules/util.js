import { Notification } from 'electron';

const { dialog } = require('electron');

// Display a notification to the user
export function notify(mainWindow, text, surpressOnClick = false) {
  let notification = new Notification({ title: 'Cleftron', body: text });
  notification.show();
  if (surpressOnClick) {
    return;
  }
  notification.on('click', () => {
    mainWindow.show();
  });
}

// Display a message to the user
export function message(mainWindow, text, surpressOnClick = false) {
  dialog.showMessageBox({
    title: 'Cleftron',
    message: text,
    buttons: ['Ok']
  });
}
