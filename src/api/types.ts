// src/api/types.ts

// Versão da API que estamos usando
export const ANKICONNECT_VERSION = 5;

// Endpoint da API AnkiConnect
export const ANKICONNECT_URL = 'http://127.0.0.1:8765';

// --- Interfaces Base ---

export interface AnkiConnectRequest<T = any> {
  action: string;
  version: typeof ANKICONNECT_VERSION;
  params?: T;
}

export interface AnkiConnectResponse<T = any> {
  result: T | null;
  error: string | null;
}

// --- Tipos Específicos para Ações ---

// Retorno da ação 'deckNames'
export type DeckNamesResponse = string[];

// Retorno da ação 'modelNames'
export type ModelNamesResponse = string[];

// Retorno da ação 'modelFieldNames'
export type ModelFieldNamesResponse = string[];

// Estrutura para o parâmetro 'note' na ação 'addNote'
export interface Note {
  deckName: string;
  modelName: string;
  fields: Record<string, string>; // Ex: { "Front": "conteúdo", "Back": "conteúdo" }
  tags: string[];
  // Opcional: para arquivos de mídia, ignoraremos por enquanto para simplificar
}

// Estrutura para o parâmetro 'notes' na ação 'addNotes'
export interface AddNotesParams {
  notes: Note[];
}