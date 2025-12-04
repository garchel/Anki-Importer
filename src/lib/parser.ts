// src/lib/parser.ts

import type { Note, PreviewCard } from '../api/types'; // Importando o novo tipo PreviewCard

// Define o delimitador que o usuário usou (ponto e vírgula)
const FIELD_DELIMITER = ';';

/**
 * Analisa o texto colado, linha por linha, e o converte em um array de objetos PreviewCard.
 * * O retorno agora inclui metadados da prévia (id, willImport) e o objeto Note pronto
 * para o AnkiConnect, permitindo que o usuário visualize e filtre antes de importar.
 *
 * @param csvText O texto cru colado pelo usuário (Frente;Verso;Tags).
 * @param deckName O nome do baralho selecionado.
 * @param modelName O nome do tipo de nota selecionado.
 * @returns Um array de objetos PreviewCard.
 * @throws Um erro se alguma linha não tiver o formato esperado.
 */
export function parseNotesFromCSVText(
  csvText: string,
  deckName: string,
  modelName: string
): PreviewCard[] { // <-- Tipo de Retorno Atualizado para PreviewCard[]
  // 1. Divide o texto em linhas
  const lines = csvText.trim().split('\n');

  const previewCards: PreviewCard[] = []; // <-- Alterado para armazenar PreviewCard
  
  // Mapeamento de campos fixo (baseado na sua correção anterior)
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

    // 4. Prepara as Tags (separadas por espaço ou vírgula)
    const tags = tagsString 
      ? tagsString.split(/\s*,\s*|\s+/).filter(tag => tag.length > 0) // Divide por vírgula ou espaço e remove tags vazias
      : [];
    
    // 5. Cria o objeto Note completo (embedado no PreviewCard)
    const noteForAnki: Note = {
      deckName: deckName,
      modelName: modelName,
      fields: {
        [fieldMapping[0]]: frontContent, 
        [fieldMapping[1]]: backContent, 
      },
      tags: tags,
    };
    
    // 6. Cria o objeto PreviewCard com metadados para a UI
    const previewCard: PreviewCard = {
      id: i + 1,
      front: frontContent, // Conteúdo da frente para exibição na prévia
      back: backContent,   // Conteúdo do verso para exibição na prévia
      tags: tags,
      willImport: true,  // <-- Novo campo: por padrão, todos são selecionados
      note: noteForAnki, // <-- Novo campo: o objeto AnkiConnect pronto
    };

    previewCards.push(previewCard);
  }

  return previewCards;
}