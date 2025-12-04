// main.js

const { app, BrowserWindow, Menu, Tray, nativeImage } = require('electron');
const path = require('path');

// Variáveis para armazenar a janela principal e a bandeja (tray)
let mainWindow = null;
let tray = null;

// Flag para controlar se o usuário realmente quer sair do app (necessário para "run in background")
let appQuitting = false;

/**
 * Cria a janela principal do aplicativo.
 */
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    minWidth: 600,
    minHeight: 400,
    title: "AnkiConnect Importer",
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
  const iconPath = path.join(app.getAppPath(), 'icon.png'); 
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

// --- Ciclo de vida do aplicativo ---

// Quando o Electron estiver pronto para criar janelas e bandejas
app.whenReady().then(() => {
  createWindow();
  createTray();

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
    // No macOS, é comum que o app permaneça rodando até o usuário sair do Dock.
    // Não fazemos nada aqui para manter a lógica do Tray.
  }
});