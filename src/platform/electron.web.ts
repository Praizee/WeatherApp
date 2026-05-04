declare global {
  interface Window {
    __ELECTRON__?: boolean;
    electron?: {
      ipcRenderer: {
        on: (channel: string, listener: (...args: unknown[]) => void) => void;
        removeListener: (channel: string, listener: (...args: unknown[]) => void) => void;
        send: (channel: string, ...args: unknown[]) => void;
      };
    };
  }
}

export function isElectron(): boolean {
  return typeof window !== 'undefined' && window.__ELECTRON__ === true;
}

export function getIPC() {
  if (isElectron()) return window.electron?.ipcRenderer ?? null;
  return null;
}
