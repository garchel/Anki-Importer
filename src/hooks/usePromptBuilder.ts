import { useMemo } from 'react';
import type { CardModel, Delimiter, TagsOption } from '@/types/prompt';
import {
  DEFAULT_PROMPT_BASE,
  CARD_EXPLANATIONS,
} from '@/data/promptDefinitions';

interface PromptBuilderParams {
  cardModel: CardModel;
  delimiter: Delimiter;
  includeTags: TagsOption;
}

// Hook responsável por toda a lógica de construção e substituição dinâmica
// das variáveis no texto base do prompt (SRP).
export const usePromptBuilder = ({
  cardModel,
  delimiter,
  includeTags,
}: PromptBuilderParams) => {
  const generatedPrompt = useMemo(() => {
    let prompt = DEFAULT_PROMPT_BASE;
    let instrucaoEspecificaCloze = '';

    // 1. Define o Formato Final (colunas)
    const formatParts = [];

    if (cardModel === 'Ocultação (Cloze)') {
      formatParts.push('Texto com Ocultação', 'Verso Extra');
      // Define a instrução específica para o modelo Cloze
      instrucaoEspecificaCloze = `Para o modelo de Ocultação, use o formato: Texto com {{c1::cloze}}${delimiter}Verso Extra${delimiter}[Tags].`;
    } else {
      formatParts.push('Frente', 'Verso');
    }

    if (includeTags === 'Sim') {
      formatParts.push('Tags (Opcional)');
    }

    const finalFormat = formatParts.join(delimiter) + '\n[... Mais linhas]';

    // 2. Substitui as Variáveis no Prompt Base
    
    // Substituições Diretas
    prompt = prompt.replace('{{DELIMITADOR}}', delimiter);
    prompt = prompt.replace('{{FORMATO_FINAL}}', finalFormat);
    prompt = prompt.replace('{{MODELO_DE_CARD}}', cardModel);
    prompt = prompt.replace('{{EXPLICACAO_MODELO}}', CARD_EXPLANATIONS[cardModel]);
    
    // Substituição Condicional (Cloze)
    prompt = prompt.replace(
      '{{INSTRUCAO_ESPECIFICA_CLOZE}}',
      instrucaoEspecificaCloze
    );

    // Manipulação do Escape (usando o delimitador como escape: ex: \| ou \//)
    const escapedDelimiter = delimiter === ';' ? '\\;' : `\\${delimiter}`;
    prompt = prompt.replace('\\{{DELIMITADOR}}', escapedDelimiter);

    return prompt.trim();
  }, [cardModel, delimiter, includeTags]);

  return { generatedPrompt };
};