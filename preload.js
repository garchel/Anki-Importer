// preload.js

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Esta função será chamada no React para se inscrever em eventos do Processo Principal
  onReceiveText: (callback) => ipcRenderer.on('global-shortcut-text', (event, text) => callback(text)),
});