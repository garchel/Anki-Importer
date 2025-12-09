import type { ReactNode } from 'react';

// Tipos de Nota/Modelos que o parser suporta.
export const AVAILABLE_MODELS = [
  'Básico',
  'Básico (digite a resposta)',
  'Básico (e cartão invertido)',
  'Omissão de Palavras',
  'Oclusao de Imagem',
];

export type FieldDelimiter = ';' | '|' | '//';
export type AllowedModel = (typeof AVAILABLE_MODELS)[number];

// --- Interfaces de Tipagem Principal ---

export interface AppSettings {
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

export interface AnkiData {
  deckNames: string[];
  modelNames: AllowedModel[];
  isLoading: boolean;
  error: string | null;
  isConnected: boolean;
  loadAnkiData: () => Promise<void>; // Função para recarregar manualmente
}

export interface SettingsContextType {
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  ankiData: AnkiData;
}

export interface SettingsProviderProps {
  children: ReactNode;
}

// Valores padrão
export const defaultSettings: AppSettings = {
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