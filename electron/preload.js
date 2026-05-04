const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('__ELECTRON__', true);

contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    on(channel, listener) {
      ipcRenderer.on(channel, listener);
    },
    removeListener(channel, listener) {
      ipcRenderer.removeListener(channel, listener);
    },
    send(channel, ...args) {
      ipcRenderer.send(channel, ...args);
    },
  },
});
