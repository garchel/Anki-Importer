const { app, BrowserWindow, Menu, Tray, nativeImage, globalShortcut, clipboard, ipcMain, shell } = require('electron');
const path = require('path');
const Store = require('electron-store').default;

app.setName("Anki Importer");

// Define o esquema de persistência, incluindo todas as settings do frontend
const store = new Store({
	name: 'user-settings', // Nome do arquivo JSON
	defaults: {
		windowWidth: 1024,
		windowHeight: 768,
		defaultDeck: 'Default',
		defaultModel: 'Básico',
		allowedModels: ['Básico', 'Básico (e cartão invertido)', 'Omissão de Palavras'],
		fieldDelimiter: ';',
		ankiDelimiter: ';',
		globalShortcut: process.platform === 'darwin' ? 'Command+G' : 'Control+G'
	}
});

/**
 * Retorna o atalho global configurado.
 */
function getGlobalShortcutFromStore() {
	const defaultShortcut = process.platform === 'darwin' ? 'Command+G' : 'Control+G';
	// Retorna o atalho salvo ou o padrão se não estiver definido
	return store.get('globalShortcut', defaultShortcut);
}

// Variáveis para armazenar a janela principal e a bandeja (tray)
let mainWindow = null;
let tray = null;
let appQuitting = false;

/**
 * Cria a janela principal do aplicativo.
 */
function createWindow() {
	const windowWidth = store.get('windowWidth');
	const windowHeight = store.get('windowHeight');

	// Define o caminho para o ícone
	const iconPath = path.join(app.getAppPath(), 'public', 'assets', 'icon.png');

	mainWindow = new BrowserWindow({
		// Usa as dimensões padrão ou salvas
		width: windowWidth,
		height: windowHeight,
		minWidth: 600,
		minHeight: 400,
		title: "Anki Importer",
		icon: iconPath,

		frame: false,
		autoHideMenuBar: true,

		webPreferences: {
			// Garantir que a comunicação do Front-end seja segura
			preload: path.join(__dirname, 'preload.js'),
			nodeIntegration: false,
			contextIsolation: true,
			devTools: process.env.NODE_ENV === 'development',
		},
	});

	// Carrega a URL do seu Front-end Vite (Verifique a porta!)
	const devServerURL = 'http://localhost:5173';

	if (process.env.NODE_ENV === 'development') {
		// Modo de Desenvolvimento
		mainWindow.loadURL(devServerURL);
		mainWindow.webContents.openDevTools();
	} else {
		// Modo de Produção (após o build do Vite)
		mainWindow.loadFile(path.join(__dirname, 'dist', 'index.html'));
	}

	// --- Lógica de Execução em Segundo Plano ---
	mainWindow.on('close', (event) => {
		if (!appQuitting) {
			// Se não for um fechamento real do aplicativo, esconde a janela
			event.preventDefault();
			mainWindow.hide();
		}
	});

	mainWindow.on('closed', () => {
		mainWindow = null;
	});

}

/**
 * Configura o ícone na bandeja do sistema (System Tray).
 */
function createTray() {
	// Caminho para o ícone. Use um arquivo pequeno (ex: icon.png)
	const iconPath = path.join(app.getAppPath(), 'public', 'assets', 'icon.png');
	// Cria o objeto de imagem, redimensionando para o tamanho padrão da bandeja (16x16)
	const icon = nativeImage.createFromPath(iconPath).resize({ width: 16, height: 16 });

	tray = new Tray(icon);
	tray.setToolTip('Anki Importer - Rodando em segundo plano');

	const contextMenu = Menu.buildFromTemplate([
		{
			label: 'Abrir Aplicativo',
			click: () => mainWindow && mainWindow.show()
		},
		{ type: 'separator' },
		{
			label: 'Sair',
			click: () => {
				// Define a flag e encerra o aplicativo
				appQuitting = true;
				app.quit();
			}
		},
	]);

	tray.setContextMenu(contextMenu);

	// Abre/esconde a janela ao clicar no ícone da bandeja
	tray.on('click', () => {
		if (mainWindow) {
			mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
		}
	});
}

/**
 * Registra o atalho global e define a ação.
 */
function registerGlobalShortcut() {
	globalShortcut.unregisterAll();

	const shortcut = getGlobalShortcutFromStore();

	const success = globalShortcut.register(shortcut, () => {

		mainWindow.webContents.send('navigate-to-importer');

		// 1. Pega o texto da área de transferência
		const selectedText = clipboard.readText().trim();

		if (mainWindow) {
			// 2. Garante que a janela está visível
			if (!mainWindow.isVisible()) {
				mainWindow.show();
			}

			// Traz a janela para o foco (primeiro plano)
			mainWindow.focus();

			// **Para macOS:** é uma boa prática chamar app.show() ou app.focus() para reativar o aplicativo
			// Se a aplicação estiver oculta no macOS (Cmd+H) ou minimizada
			if (process.platform === 'darwin') {
				app.show(); // Traz o aplicativo de volta para o primeiro plano (útil para macOS)
			}



			// 3. Envia o texto para o processo de renderização (React)
			if (selectedText) {
				mainWindow.webContents.send('global-shortcut-text', selectedText);
			} else {
				// Opcional: Avisar o usuário se nada foi copiado
				mainWindow.webContents.send('global-shortcut-text', 'Nenhum texto encontrado na área de transferência.');
			}
		}
	});

	if (!success) {
		console.error(`Falha ao registrar o atalho global: ${shortcut}`);
	}
}

/**
 * Registra o handler IPC para redimensionar a janela e persistir configurações
 */
function registerIpcHandlers() {

	// Handler para o frontend pedir todas as configurações salvas (get-all-settings)
	ipcMain.handle('get-all-settings', (event) => {
		return store.store; // Retorna todo o objeto de configurações
	});

	// Handle para comando de redimensionamento vindo do frontend (update-window-size)
	ipcMain.on('update-window-size', (event, size) => {
		if (mainWindow && size.width && size.height) {
			// 1. Aplica o redimensionamento na janela principal
			mainWindow.setSize(size.width, size.height, true);

			// 2. Centraliza a janela após o redimensionamento (melhora UX)
			mainWindow.center();

			// 3. Salva as novas dimensões na store permanentemente
			store.set('windowWidth', size.width);
			store.set('windowHeight', size.height);
		}
	});

	// Handle para salvar configurações parciais do frontend (save-settings)
	ipcMain.on('save-settings', (event, newSettings) => {
		if (newSettings && typeof newSettings === 'object') {
			for (const key in newSettings) {
				// Salva cada propriedade na store de forma persistente
				store.set(key, newSettings[key]);
			}
		}
	});

	// Handle para minimizar a janela
	ipcMain.on('minimize-window', () => {
		if (mainWindow) {
			mainWindow.minimize();
		}
	});

	// Handle para maximizar/restaurar a janela
	ipcMain.on('maximize-window', () => {
		if (mainWindow) {
			if (mainWindow.isMaximized()) {
				mainWindow.unmaximize();
			} else {
				mainWindow.maximize();
			}
		}
	});

	// Handle para fechar/sair completamente do aplicativo (Fecha mesmo)
	ipcMain.on('quit-app', () => {
		// Define a flag e encerra o aplicativo, ignorando a lógica do 'close' (hide)
		appQuitting = true;
		app.quit();
	});

	ipcMain.on('open-external-url', (event, url) => {
		// Usa o módulo shell do Electron para abrir o URL no navegador padrão
		shell.openExternal(url);
	});

	// Handle para salvar configurações parciais do frontend (save-settings)
	ipcMain.on('save-settings', (event, newSettings) => {
		if (newSettings && typeof newSettings === 'object') {
			for (const key in newSettings) {
				// Salva cada propriedade na store de forma persistente
				store.set(key, newSettings[key]);
			}

			// NOVO: Se o atalho global foi alterado, re-registra
			if (Object.prototype.hasOwnProperty.call(newSettings, 'globalShortcut')) {
				registerGlobalShortcut();
			}
		}
	});
}

// --- Ciclo de vida do aplicativo ---
// Quando o Electron estiver pronto para criar janelas e bandejas
app.whenReady().then(() => {
	createWindow();
	createTray();
	registerGlobalShortcut();
	registerIpcHandlers();

	Menu.setApplicationMenu(null);

	app.on('activate', () => {
		// Reabre a janela se o ícone do dock for clicado (principalmente macOS)
		if (BrowserWindow.getAllWindows().length === 0) createWindow();
	});
});

// Garante que a flag de saída seja setada antes de fechar de vez (para o System Tray)
app.on('before-quit', () => {
	appQuitting = true;
});

// Encerra o aplicativo quando todas as janelas forem fechadas (exceto no macOS)
app.on('window-all-closed', () => {
	// Mantemos o aplicativo ativo no Windows/Linux mesmo que a janela principal feche,
	// para que o Tray continue visível.
	if (process.platform !== 'darwin') {
		// Não fazemos nada aqui para manter a lógica do Tray.
	}
});

app.on('will-quit', () => {
	globalShortcut.unregisterAll();
});