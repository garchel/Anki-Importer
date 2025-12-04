// src/api/AnkiService.ts

import { ANKICONNECT_URL, ANKICONNECT_VERSION } from "./types";

import type {
	AnkiConnectRequest,
	AnkiConnectResponse,
	DeckNamesResponse,
	ModelNamesResponse,
	ModelFieldNamesResponse,
	AddNotesParams,
	Note,
} from "./types";

/**
 * Função utilitária para invocar ações no AnkiConnect.
 * @param action - A ação da API a ser chamada (ex: 'deckNames').
 * @param params - O objeto de parâmetros para a ação.
 * @returns O resultado da ação ou lança um erro.
 */
async function invoke<T, P = any>(action: string, params?: P): Promise<T> {
	const requestBody: AnkiConnectRequest<P> = {
		action,
		version: ANKICONNECT_VERSION,
		...(params && { params }),
	};

	try {
		const response = await fetch(ANKICONNECT_URL, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(requestBody),
		});

		if (!response.ok) {
			throw new Error(
				`Erro HTTP ao conectar ao AnkiConnect: ${response.status} ${response.statusText}`
			);
		}

		const jsonResponse: AnkiConnectResponse<T> = await response.json();

		if (jsonResponse.error) {
			throw new Error(`Erro do AnkiConnect: ${jsonResponse.error}`);
		}

		if (jsonResponse.result === null || jsonResponse.result === undefined) {
			// Retorna null para ações que não retornam resultado (ex: addNotes, changeDeck)
			return null as T;
		}

		return jsonResponse.result;
	} catch (error) {
		if (
			error instanceof TypeError &&
			(error.message.includes("Failed to fetch") ||
				error.message.includes("NetworkError"))
		) {
			throw new Error(
				"Falha ao conectar ao AnkiConnect. Certifique-se de que o Anki está aberto e o add-on AnkiConnect está instalado."
			);
		}
		throw error;
	}
}

// --- Funções da API ---

/**
 * Verifica a conectividade e a versão.
 * @returns A versão do AnkiConnect.
 */
export const getVersion = async (): Promise<number> => {
	return invoke<number>("version");
};

/**
 * Obtém a lista de todos os baralhos.
 * @returns Um array de nomes de baralhos.
 */
export const getDeckNames = async (): Promise<DeckNamesResponse> => {
	return invoke<DeckNamesResponse>("deckNames");
};

/**
 * Obtém a lista de todos os tipos de nota (modelos).
 * @returns Um array de nomes de modelos.
 */
export const getModelNames = async (): Promise<ModelNamesResponse> => {
	return invoke<ModelNamesResponse>("modelNames");
};

/**
 * Obtém os nomes dos campos para um tipo de nota específico.
 * @param modelName - O nome do tipo de nota.
 * @returns Um array de nomes de campos (ex: ['Front', 'Back']).
 */
export const getModelFieldNames = async (
	modelName: string
): Promise<ModelFieldNamesResponse> => {
	return invoke<ModelFieldNamesResponse>("modelFieldNames", { modelName });
};

/**
 * Adiciona múltiplos flashcards ao Anki.
 * @param notes - Um array de objetos Note para serem adicionados.
 * @returns Um array de IDs das notas criadas (ou null em caso de falha).
 */
export const addNotes = async (notes: Note[]): Promise<(number | null)[]> => {
	const params: AddNotesParams = { notes };
	// A ação addNotes retorna um array de IDs ou null.
	return invoke<(number | null)[]>("addNotes", params);
};
