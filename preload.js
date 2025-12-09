const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
	// Recebe o texto copiado do atalho global
	receiveGlobalShortcutText: (callback) => ipcRenderer.on('global-shortcut-text', (event, text) => callback(text)),

	// Envia um comando para redimensionar a janela principal
	updateWindowSize: (size) => ipcRenderer.send('update-window-size', size),

	// Método para buscar todas as configurações ao iniciar
	getAllSettings: () => ipcRenderer.invoke('get-all-settings'),

	// Método para salvar as configurações do frontend
	saveSettings: (settings) => ipcRenderer.send('save-settings', settings),


	minimizeWindow: () => ipcRenderer.send('minimize-window'),
	maximizeWindow: () => ipcRenderer.send('maximize-window'),
	closeWindow: () => ipcRenderer.send('quit-app'),
	openExternal: (url) => ipcRenderer.send('open-external-url', url),

	receive: (channel, func) => {
		const validChannels = ['global-shortcut-text', 'navigate-to-importer'];
		if (validChannels.includes(channel)) {
			ipcRenderer.on(channel, (event, ...args) => func(...args));
		}
	},

});