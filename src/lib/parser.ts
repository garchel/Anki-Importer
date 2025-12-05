import type { Note, PreviewCard } from "../api/types";
import type { FieldDelimiter } from "../components/context/SettingsContext";

// Mapeamento de Tipos de Notas Anki (usados no parser)
type NoteFormatConfig = {
	// Número mínimo de campos OBRIGATÓRIOS (excluindo tags)
	minFields: number;
	// Mapeamento de nomes de campos (que serão usados no objeto Note.fields)
	fieldNames: string[];
	// Se a última parte da linha (além dos campos principais) deve ser tratada como Tags
	allowOptionalTags: boolean;
};

// --- NOVAS CONFIGURAÇÕES BASEADAS NA ESTRUTURA REAL DO ANKI ---
const MODEL_CONFIGS: { [key: string]: NoteFormatConfig } = {
	Básico: {
		minFields: 2,
		fieldNames: ["Frente", "Verso"],
		allowOptionalTags: true,
	},
	"Básico (digite a resposta)": {
		minFields: 2,
		fieldNames: ["Frente", "Verso"],
		allowOptionalTags: true,
	},
	"Básico (e cartão invertido)": {
		// O Anki usa apenas Frente e Verso, e o cartão invertido é gerado automaticamente.
		minFields: 2,
		fieldNames: ["Frente", "Verso"],
		allowOptionalTags: true,
	},
	"Omissão de Palavras": {
		// Texto cloze
		// Exige 2 campos: Texto (o texto com {{c1::cloze}}) e Verso Extra
		minFields: 2,
		fieldNames: ["Texto", "Verso Extra"],
		allowOptionalTags: true,
	},
};

/**
 * Analisa o texto colado, linha por linha, e o converte em um array de objetos PreviewCard.
 * @param csvText O texto cru colado pelo usuário.
 * @param deckName O nome do baralho selecionado.
 * @param modelName O nome do tipo de nota selecionado.
 * @param fieldDelimiter O delimitador usado pelo usuário no input (ex: ';').
 * @param ankiDelimiter O delimitador configurado no Anki (usado para referência em exportação, mas usamos o fieldDelimiter aqui).
 * @returns Um array de objetos PreviewCard.
 * @throws Um erro se alguma linha não tiver o formato esperado.
 */
export function parseNotesFromCSVText(
	csvText: string,
	deckName: string,
	modelName: string,
	fieldDelimiter: FieldDelimiter, // NOVO ARGUMENTO
	ankiDelimiter: FieldDelimiter // NOVO ARGUMENTO (não usado no parser, mas parte da API)
): PreviewCard[] {
	if (!deckName || !modelName) {
		throw new Error(
			"O Baralho e o Tipo de Nota devem ser selecionados antes de analisar o texto."
		);
	}

	const config = MODEL_CONFIGS[modelName];

	if (!config) {
		throw new Error(
			`Configuração não encontrada para o Tipo de Nota: "${modelName}".`
		);
	}

	const { minFields, fieldNames, allowOptionalTags } = config;
	const lines = csvText.trim().split("\n");
	const previewCards: PreviewCard[] = [];

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i].trim();
		if (!line) continue; // Ignora linhas vazias

		// Substituição do FIELD_DELIMITER fixo pelo parâmetro dinâmico
		const parts = line.split(fieldDelimiter);

		// --- 1. VALIDAÇÃO DO NÚMERO DE CAMPOS ---

		// Número máximo esperado (campos obrigatórios + 1 para tags)
		const maxParts = minFields + (allowOptionalTags ? 1 : 0);

		if (parts.length < minFields || parts.length > maxParts) {
			const expectedParts = allowOptionalTags
				? `${minFields} (para campos) ou ${maxParts} (para campos + tags)`
				: `${minFields}`;

			const expectedFormat = allowOptionalTags
				? `${fieldNames.join(fieldDelimiter)};[Tags Opcionais]`
				: fieldNames.join(fieldDelimiter);

			throw new Error(
				`Erro na Linha ${
					i + 1
				}: Formato inválido para "${modelName}". Esperado ${expectedParts} campos. Formato: ${expectedFormat}. Encontrado ${
					parts.length
				} campos.`
			);
		}

		// --- 2. EXTRAÇÃO DOS DADOS ---

		// Os primeiros 'minFields' são os campos de nota (Frente, Verso, etc.)
		const noteFields: { [key: string]: string } = {};
		for (let j = 0; j < minFields; j++) {
			// Mapeia o nome do campo da config para o valor do campo na linha, aplicando trim
			noteFields[fieldNames[j]] = parts[j].trim();
		}

		// O último campo é Tags (se permitido e se existir)
		let tags: string[] = [];
		if (allowOptionalTags && parts.length === maxParts) {
			const tagsString = parts[minFields].trim();
			// Prepara as Tags: Divide por vírgula ou espaço e remove tags vazias
			tags = tagsString
				? tagsString.split(/\s*,\s*|\s+/).filter(tag => tag.length > 0)
				: [];
		}

		// --- 3. CRIAÇÃO DOS OBJETOS ---

		// Conteúdo de Preview (Para a tabela de prévia)
		// Usamos os dois primeiros campos, independentemente de seus nomes no Anki, se existirem.
		const previewFront = noteFields[fieldNames[0]] || "";
		const previewBack =
			minFields > 1 && fieldNames[1] ? noteFields[fieldNames[1]] : "";

		// Objeto Note pronto para o AnkiConnect
		const noteForAnki: Note = {
			deckName: deckName,
			modelName: modelName,
			fields: noteFields, // Inclui todos os campos: Frente, Verso, Inverter, etc.
			tags: tags,
		};

		// Objeto PreviewCard para a UI
		const previewCard: PreviewCard = {
			id: i + 1,
			front: previewFront,
			back: previewBack,
			tags: tags,
			willImport: true,
			note: noteForAnki,
		};

		previewCards.push(previewCard);
	}

	return previewCards;
}
