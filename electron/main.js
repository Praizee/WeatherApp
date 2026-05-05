const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');
const { buildMenu } = require('./menu');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 480,
    minHeight: 600,
    backgroundColor: '#0B1220',
    title: 'Weather App',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  const url = isDev
    ? 'http://localhost:8081'
    : `file://${path.join(__dirname, '../dist/index.html')}`;

  mainWindow.loadURL(url);

  // Inject a loading overlay while Metro compiles the first bundle (~40s cold start).
  // did-finish-load fires once the JS bundle has executed and the page is interactive.
  if (isDev) {
    mainWindow.webContents.on('dom-ready', () => {
      mainWindow.webContents.executeJavaScript(`
        const el = document.createElement('div');
        el.id = '_el_loading';
        el.style.cssText = 'position:fixed;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#0B1220;color:#60A5FA;font-family:system-ui;gap:16px;z-index:9999;pointer-events:none;transition:opacity 0.4s';
        el.innerHTML = '<div style="font-size:40px">⛅</div><div style="font-size:13px;opacity:0.6;letter-spacing:0.05em">Bundling — first load takes ~40s</div>';
        document.body.appendChild(el);

        // Remove overlay once React renders into #root (HMR keeps connection open
        // so did-finish-load never fires in dev mode)
        const root = document.getElementById('root');
        const dismiss = () => {
          const overlay = document.getElementById('_el_loading');
          if (overlay) { overlay.style.opacity = '0'; setTimeout(() => overlay.remove(), 400); }
        };
        if (root && root.childElementCount > 0) {
          dismiss();
        } else {
          const obs = new MutationObserver(() => {
            if (root && root.childElementCount > 0) { obs.disconnect(); dismiss(); }
          });
          obs.observe(root || document.body, { childList: true, subtree: false });
        }
      `).catch(() => {});
    });

    mainWindow.webContents.on('did-fail-load', () => {
      setTimeout(() => mainWindow.loadURL(url), 2000);
    });
  }

  if (isDev) {
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  }

  // Grant geolocation permission automatically (user already approved on mobile)
  mainWindow.webContents.session.setPermissionRequestHandler((_wc, permission, callback) => {
    callback(permission === 'geolocation');
  });

  buildMenu(mainWindow);
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// Native context menu from renderer
ipcMain.on('context-menu', (event, items) => {
  const webContents = event.sender; // capture ref before async closure
  const win = BrowserWindow.fromWebContents(webContents);
  console.log('[context-menu] received items:', items?.length, 'win:', win ? 'ok' : 'null');
  if (!win) return;

  const template = items.map((item, index) => ({
    label: item.label,
    click: () => {
      console.log('[context-menu] clicked index:', index);
      webContents.send('context-menu-click', index);
    },
  }));

  Menu.buildFromTemplate(template).popup({ window: win });
});
