import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import type { ReactNode } from 'react';
import { getDeckNames, getModelNames, getVersion } from '@/api/AnkiService';

// Tipos de Nota/Modelos que o parser suporta.
export const AVAILABLE_MODELS = [
	'Básico',
	'Básico (digite a resposta)',
	'Básico (e cartão invertido)',
	'Omissão de Palavras',
	'Oclusao de Imagem',
];

// O programa usará um destes como delimitador
export type FieldDelimiter = ';' | '|' | '//';
export type AllowedModel = (typeof AVAILABLE_MODELS)[number];

// --- Interfaces de Tipagem Principal ---

interface AppSettings {
	// Configurações da Janela
	windowWidth: number;
	windowHeight: number;

	// Configurações Padrão de Importação
	defaultDeck: string;
	defaultModel: AllowedModel;

	// Delimitadores
	allowedModels: AllowedModel[];
	fieldDelimiter: FieldDelimiter; // Delimitador usado no input do usuário
	ankiDelimiter: FieldDelimiter; // Delimitador configurado no Anki para exportação/importação

	// Atalho Global
	globalShortcut: string; // Ex: 'Control+G'
}

interface AnkiData {
	deckNames: string[];
	modelNames: AllowedModel[];
	isLoading: boolean;
	error: string | null;
	isConnected: boolean;
	loadAnkiData: () => Promise<void>; // Função para recarregar manualmente
}

interface SettingsContextType {
	settings: AppSettings;
	updateSettings: (newSettings: Partial<AppSettings>) => void;
	ankiData: AnkiData; // Novo objeto para dados do Anki
}

// Valores padrão (usados como fallback se o store não tiver valor)
const defaultSettings: AppSettings = {
	windowWidth: 1024,
	windowHeight: 768,
	defaultDeck: 'Default',
	defaultModel: 'Básico',
	allowedModels: [
		'Básico',
		'Básico (e cartão invertido)',
		'Omissão de Palavras',
	],
	fieldDelimiter: ';',
	ankiDelimiter: ';',

	globalShortcut: 'Control+G',
};

// --- Criação e Hook ---
const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const useSettings = () => {
	const context = useContext(SettingsContext);
	if (!context) {
		throw new Error('useSettings deve ser usado dentro de um SettingsProvider');
	}
	return context;
};

// --- Provedor ---
interface SettingsProviderProps {
	children: ReactNode;
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
	const [settings, setSettings] = useState<AppSettings>(defaultSettings);

	// Ref para rastrear o tamanho anterior da janela que foi setado pelo Electron, 
	// evitando que o redimensionamento manual (que salva no settings) chame o Electron.
	const lastElectronSizeRef = useRef({
		width: defaultSettings.windowWidth,
		height: defaultSettings.windowHeight
	});


	// NOVOS ESTADOS PARA DADOS DO ANKI
	const [deckNames, setDeckNames] = useState<string[]>([]);
	const [modelNames, setModelNames] = useState<AllowedModel[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Função para atualizar as configurações e persistir no Electron
	const updateSettings = useCallback((newSettings: Partial<AppSettings>) => {
		setSettings(prev => {
			const updated = {
				...prev,
				...newSettings,
			};

			// 1. Envia a mudança para o Electron para persistência (saveSettings agora existe)
			if (window.electronAPI && window.electronAPI.saveSettings) {
				window.electronAPI.saveSettings(newSettings);
			}

			return updated;
		});
	}, []);

	// Efeito para Carregar Configurações Persistidas na Inicialização
	useEffect(() => {
		// getAllSettings agora existe e retorna Promise<Partial<AppSettings>>
		if (window.electronAPI && window.electronAPI.getAllSettings) {
			window.electronAPI.getAllSettings().then(savedSettings => {
				// savedSettings é tipado como Partial<AppSettings>, eliminando o erro 'any'
				setSettings(prev => ({
					...prev,
					...savedSettings,
					// Garante que os modelos e delimitadores sejam tipados corretamente se vierem do store
					allowedModels: (savedSettings.allowedModels as AllowedModel[] | undefined) || defaultSettings.allowedModels,
					fieldDelimiter: (savedSettings.fieldDelimiter as FieldDelimiter | undefined) || defaultSettings.fieldDelimiter,
					ankiDelimiter: (savedSettings.ankiDelimiter as FieldDelimiter | undefined) || defaultSettings.ankiDelimiter,
				}));
			}).catch(err => {
				console.error("Falha ao carregar configurações salvas:", err);
				// Permite que o app continue com as defaultSettings
			});
		}
	}, []);


	// LÓGICA DE CARREGAMENTO DO ANKI CENTRALIZADA
	const loadAnkiData = useCallback(async () => {
		setError(null);
		setIsLoading(true);
		try {
			await getVersion();
			const decks = await getDeckNames();
			const allModels = await getModelNames();

			// Filtrando modelos permitidos
			const filteredModels = allModels.filter((modelName) =>
				AVAILABLE_MODELS.includes(modelName as AllowedModel)
			) as AllowedModel[];

			setDeckNames(decks);
			setModelNames(filteredModels);

			// Atualiza o defaultDeck se o atual não for válido
			if (decks.length > 0 && !decks.includes(settings.defaultDeck)) {
				updateSettings({ defaultDeck: decks[0] });
			}

			// Atualiza o defaultModel se o atual não for válido
			if (filteredModels.length > 0 && !filteredModels.includes(settings.defaultModel)) {
				updateSettings({ defaultModel: filteredModels[0] });
			}

		} catch (err: any) {
			setError(err.message || 'Erro desconhecido ao conectar ao Anki.');
			setDeckNames([]);
			setModelNames([]);
		} finally {
			setIsLoading(false);
		}
	}, [settings.defaultDeck, settings.defaultModel, updateSettings]);

	// Chama a função de carregamento na montagem
	useEffect(() => {
		loadAnkiData();
	}, [loadAnkiData]);

	// Lógica de Redimensionamento
	useEffect(() => {
		// Só envia o comando Electron se o ElectronAPI estiver disponível
		if (!window.electronAPI || !window.electronAPI.updateWindowSize) {
			return;
		}

		const { windowWidth: newWidth, windowHeight: newHeight } = settings;

		// 1. Verifica se houve realmente uma mudança nos settings
		const hasChanged = (newWidth !== lastElectronSizeRef.current.width) ||
			(newHeight !== lastElectronSizeRef.current.height);

		if (!hasChanged) {
			return;
		}

		// 2. Chama a API do Electron para aplicar o novo tamanho
		window.electronAPI.updateWindowSize({
			width: newWidth,
			height: newHeight,
		});

		// 3. Atualiza a referência com o tamanho que acabamos de pedir ao Electron para usar.
		lastElectronSizeRef.current = {
			width: newWidth,
			height: newHeight
		};

	}, [settings.windowWidth, settings.windowHeight]);

	const ankiData: AnkiData = {
		deckNames,
		modelNames,
		isLoading,
		error,
		isConnected: !isLoading && error === null,
		loadAnkiData,
	};

	return (
		<SettingsContext.Provider value={{ settings, updateSettings, ankiData }}>
			{children}
		</SettingsContext.Provider>
	);
};