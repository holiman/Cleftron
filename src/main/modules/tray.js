import { Menu, Tray, app, nativeImage } from 'electron';
import path from 'path';

export function setupTray(mainWindow) {
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
