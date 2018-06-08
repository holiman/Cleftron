import { Notification } from 'electron';

// Display a notification to the user
export function note(mainWindow, text, surpressOnClick = false) {
  let notification = new Notification({ title: 'Cleftron', body: text });
  notification.show();
  if (surpressOnClick) {
    return;
  }
  notification.on('click', () => {
    mainWindow.show();
  });
}
