// src/lib/parser.ts

import type { Note } from '../api/types';

// Define o delimitador que o usuário usou (ponto e vírgula)
const FIELD_DELIMITER = ';';

/**
 * Analisa o texto colado, linha por linha, e o converte em um array de objetos Note.
 *
 * @param csvText O texto cru colado pelo usuário (Frente;Verso;Tags).
 * @param deckName O nome do baralho selecionado.
 * @param modelName O nome do tipo de nota selecionado (espera-se que tenha os campos 'Front', 'Back' e 'Tags').
 * @returns Um array de objetos Note, pronto para o AnkiConnect.
 * @throws Um erro se alguma linha não tiver o formato esperado.
 */
export function parseNotesFromCSVText(
  csvText: string,
  deckName: string,
  modelName: string
): Note[] {
  // 1. Divide o texto em linhas
  const lines = csvText.trim().split('\n');

  const notes: Note[] = [];
  
  // Mapeamento de campos fixo para o formato que estamos usando
  // (Note que o AnkiConnect espera os nomes dos campos exatos do seu Model,
  // e as Tags são passadas separadamente)
  const fieldMapping = ['Frente', 'Verso'];

  if (!deckName || !modelName) {
    throw new Error('O Baralho e o Tipo de Nota devem ser selecionados antes de analisar o texto.');
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue; // Ignora linhas vazias

    // 2. Divide a linha usando o delimitador ';'
    const parts = line.split(FIELD_DELIMITER);

    // 3. Validação do Formato (esperamos 3 partes: Frente, Verso, Tags)
    if (parts.length !== 3) {
      throw new Error(`Erro na Linha ${i + 1}: Formato inválido. Esperado 3 campos (Frente;Verso;Tags), encontrado ${parts.length}.`);
    }

    const [frontContent, backContent, tagsString] = parts.map(p => p.trim());

    // 4. Prepara as Tags (separadas por espaço na sua entrada)
    // Se a string de tags estiver vazia, retorna um array vazio.
    const tags = tagsString 
      ? tagsString.split(/\s*,\s*|\s+/).filter(tag => tag.length > 0) // Divide por vírgula ou espaço e remove tags vazias
      : [];
    
    // 5. Cria o objeto Note para o AnkiConnect
    const newNote: Note = {
      deckName: deckName,
      modelName: modelName,
      fields: {
        [fieldMapping[0]]: frontContent, // Mapeia para "Front"
        [fieldMapping[1]]: backContent,  // Mapeia para "Back"
      },
      tags: tags,
    };

    notes.push(newNote);
  }

  return notes;
}