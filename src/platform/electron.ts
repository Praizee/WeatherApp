// TypeScript resolution shim — Metro uses electron.web.ts / electron.native.ts at runtime.
export { isElectron, getIPC } from './electron.web';
