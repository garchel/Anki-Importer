// Declarações de Módulos (para imports que o TS não entende nativamente)
declare module "@/components/ui/label";
declare module "@/components/ui/checkbox";
declare module "@/components/ui/separator";
declare module "@/components/ui/input";
// Adicione mais módulos de UI conforme necessário

// Tipagem da API exposta pelo Electron (preload.js) - CENTRALIZADA
interface ElectronAPI {
	// Função para receber o texto do atalho global (Alt+G)
	receiveGlobalShortcutText: (callback: (text: string) => void) => void;

	// Função para redimensionar a janela principal do Electron
	updateWindowSize: (size: { width: number; height: number }) => void;

	// Função para buscar todas as configurações persistidas
	getAllSettings: () => Promise<
		Partial<import("./caminho/para/o/seu/arquivo").AppSettings>
	>;

	// Função para salvar as configurações
	saveSettings: (
		settings: Partial<import("./caminho/para/o/seu/arquivo").AppSettings>
	) => void;

	onReceiveText: (callback: (value: string) => void) => void;
}

// Estende a interface Window para incluir a nossa ElectronAPI
interface Window {
	electronAPI?: ElectronAPI;
}
