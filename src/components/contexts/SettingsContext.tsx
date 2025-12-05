import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react'


// Tipos de Nota/Modelos que o AnkiConnect retorna e que o parser suporta.
export const AVAILABLE_MODELS = [
	'Básico',
	'Básico (digite a resposta)',
	'Básico (e cartão invertido)',
	'Omissão de Palavras',
	'Oclusao de Imagem',
];

export type AllowedModel = (typeof AVAILABLE_MODELS)[number];
export type FieldDelimiter = ';' | '|' | '\t'; // Adicionando possíveis delimitadores

interface AppSettings {
	// Configurações da Janela
	windowWidth: number;
	windowHeight: number;

	// Configurações Padrão de Importação
	defaultDeck: string;
	defaultModel: string;

	// Lista de Modelos do Anki que o usuário permite visualizar/importar.
	allowedModels: AllowedModel[];
	// O delimitador que o parser deve usar ao ler o texto (e.g., ';' ou ',').
	fieldDelimiter: FieldDelimiter;
}

interface SettingsContextType {
	settings: AppSettings;
	// Função para atualizar as configurações
	updateSettings: (newSettings: Partial<AppSettings>) => void;
}

// Valores padrão
const defaultSettings: AppSettings = {
	windowWidth: 1024, // Novo valor padrão de largura
	windowHeight: 768, // Novo valor padrão de altura
	defaultDeck: 'Default', // Deck padrão do Anki
	defaultModel: 'Básico', // Tipo de card/nota padrão
	allowedModels: [
		'Básico',
		'Básico (e cartão invertido)',
		'Omissão de Palavras',
	],
	fieldDelimiter: ';',
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

	const updateSettings = (newSettings: Partial<AppSettings>) => {
		setSettings(prev => ({
			...prev,
			...newSettings,
		}));

		// Verifica se a largura ou altura da janela foi alterada
		if (newSettings.windowWidth !== undefined || newSettings.windowHeight !== undefined) {

			// AGORA SEM ERROS DE TIPO! O TypeScript reconhece window.electronAPI
			if (window.electronAPI && window.electronAPI.updateWindowSize) {
				window.electronAPI.updateWindowSize({
					width: newSettings.windowWidth ?? settings.windowWidth,
					height: newSettings.windowHeight ?? settings.windowHeight,
				});
			}
		}
	};

	return (
		<SettingsContext.Provider value={{ settings, updateSettings }}>
			{children}
		</SettingsContext.Provider>
	);
};