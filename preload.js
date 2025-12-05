const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
	// 1. Recebe o texto copiado do atalho global
	receiveGlobalShortcutText: (callback) => ipcRenderer.on('global-shortcut-text', (event, text) => callback(text)),

	// 2. Envia um comando para redimensionar a janela principal
	updateWindowSize: (size) => ipcRenderer.send('update-window-size', size),

	// Método para buscar todas as configurações ao iniciar
	getAllSettings: () => ipcRenderer.invoke('get-all-settings'),

	// Método para salvar as configurações do frontend
	saveSettings: (settings) => ipcRenderer.send('save-settings', settings),

	// Método redundante mantido para compatibilidade
	onReceiveText: (callback) => ipcRenderer.on('global-shortcut-text', (event, text) => callback(text)),
});