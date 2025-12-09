import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { defaultSettings,} from '@/types/settings';
import type {
	AppSettings,
	SettingsContextType,
	SettingsProviderProps,
	FieldDelimiter,
	AllowedModel,
} from '@/types/settings';

import { useAnkiDataLoader } from '@/hooks/useAnkiDataLoader';
import { useWindowResizeEffect } from '@/hooks/useWindowResizeEffect';

// --- Criação do Contexto ---
const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const useSettings = () => {
	const context = useContext(SettingsContext);
	if (!context) {
		throw new Error('useSettings deve ser usado dentro de um SettingsProvider');
	}
	return context;
};

export type { FieldDelimiter, AllowedModel };

// --- Provedor ---
export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
	const [settings, setSettings] = useState<AppSettings>(defaultSettings);

	// Função para atualizar as configurações e persistir no Electron (SRP: Persistência)
	const updateSettings = useCallback((newSettings: Partial<AppSettings>) => {
		setSettings(prev => {
			const updated = {
				...prev,
				...newSettings,
			};

			// Envia a mudança para o Electron para persistência (saveSettings agora existe)
			if (window.electronAPI && window.electronAPI.saveSettings) {
				window.electronAPI.saveSettings(newSettings);
			}

			return updated;
		});
	}, []);

	// Efeito para Carregar Configurações Persistidas na Inicialização
	useEffect(() => {
		// Tenta carregar as configurações salvas no Electron
		if (window.electronAPI && window.electronAPI.getAllSettings) {
			window.electronAPI.getAllSettings().then(savedSettings => {
				setSettings(prev => ({
					...prev,
					...savedSettings,
					// Garante a tipagem correta para evitar erros
					allowedModels: (savedSettings.allowedModels as AllowedModel[] | undefined) || defaultSettings.allowedModels,
					fieldDelimiter: (savedSettings.fieldDelimiter as FieldDelimiter | undefined) || defaultSettings.fieldDelimiter,
					ankiDelimiter: (savedSettings.ankiDelimiter as FieldDelimiter | undefined) || defaultSettings.ankiDelimiter,
				}));
			}).catch(err => {
				console.error('Falha ao carregar configurações salvas:', err);
				// Continua com defaultSettings
			});
		}
	}, []);

	// 💡 Lógica de Carregamento de Dados do Anki (Extraída)
	const ankiData = useAnkiDataLoader({ currentSettings: settings, updateSettings });

	// 💡 Lógica de Redimensionamento da Janela (Extraída)
	useWindowResizeEffect({ settings });

	const contextValue: SettingsContextType = {
		settings,
		updateSettings,
		ankiData,
	};

	return (
		<SettingsContext.Provider value={contextValue}>
			{children}
		</SettingsContext.Provider>
	);
};