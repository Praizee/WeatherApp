const { Menu } = require('electron');

function send(win, action) {
  win.webContents.send('menu-action', action);
}

function buildMenu(win) {
  const isMac = process.platform === 'darwin';

  const template = [
    // macOS app menu
    ...(isMac ? [{
      label: 'Weather App',
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' },
      ],
    }] : []),

    {
      label: 'File',
      submenu: [
        {
          label: 'Search Cities',
          accelerator: 'CmdOrCtrl+F',
          click: () => send(win, 'nav-search'),
        },
        { type: 'separator' },
        isMac ? { role: 'close' } : { role: 'quit', accelerator: 'CmdOrCtrl+Q' },
      ],
    },

    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' },
      ],
    },

    {
      label: 'View',
      submenu: [
        {
          label: 'Home',
          accelerator: 'CmdOrCtrl+H',
          click: () => send(win, 'nav-home'),
        },
        {
          label: 'Saved Cities',
          accelerator: 'CmdOrCtrl+B',
          click: () => send(win, 'nav-cities'),
        },
        { type: 'separator' },
        {
          label: 'Refresh Weather',
          accelerator: 'F5',
          click: () => send(win, 'refresh'),
        },
        { type: 'separator' },
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
      ],
    },

    {
      label: 'Help',
      submenu: [
        {
          label: 'Keyboard Shortcuts',
          click: () => {
            const { dialog } = require('electron');
            dialog.showMessageBox(win, {
              type: 'info',
              title: 'Keyboard Shortcuts',
              message: 'Weather App Shortcuts',
              detail: [
                'Ctrl+F  —  Search cities',
                'Ctrl+H  —  Home',
                'Ctrl+B  —  Saved cities',
                'F5       —  Refresh weather',
                'Escape —  Go back / dismiss',
                'Ctrl+Q  —  Quit',
              ].join('\n'),
            });
          },
        },
        { type: 'separator' },
        {
          label: 'About Weather App',
          click: () => {
            const { dialog } = require('electron');
            dialog.showMessageBox(win, {
              type: 'info',
              title: 'About',
              message: 'Weather App',
              detail: 'Cross-platform weather app built with Expo + Electron.',
            });
          },
        },
      ],
    },
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

module.exports = { buildMenu };
