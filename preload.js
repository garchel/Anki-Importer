const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    // 1. Recebe o texto copiado do atalho global (Antigo onReceiveText)
    receiveGlobalShortcutText: (callback) => ipcRenderer.on('global-shortcut-text', (event, text) => callback(text)),
    
    // 2. NOVO: Envia um comando para redimensionar a janela principal
    updateWindowSize: (size) => ipcRenderer.send('update-window-size', size),
});