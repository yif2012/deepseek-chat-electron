const { contextBridge, ipcRenderer, shell } = require('electron');

contextBridge.exposeInMainWorld('ipcRenderer', {
  invoke: (channel, ...args) => ipcRenderer.invoke(channel, ...args),
  on: (channel, func) => ipcRenderer.on(channel, func),
  once: (channel, func) => ipcRenderer.once(channel, func),
  removeListener: (channel, func) => ipcRenderer.removeListener(channel, func),
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel),
  send: (channel, ...args) => ipcRenderer.send(channel, ...args),
  sendSync: (channel, ...args) => ipcRenderer.sendSync(channel, ...args),
  sendTo: (webContentsId, channel, ...args) => ipcRenderer.sendTo(webContentsId, channel, ...args),
  sendToHost: (channel, ...args) => ipcRenderer.sendToHost(channel, ...args),
  togglePin: (shouldPin) => ipcRenderer.invoke('toggle-pin-window', shouldPin),
  openExternal: (url) => shell.openExternal(url),
});
