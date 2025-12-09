import type { CardModel, Delimiter, TagsOption } from '@/types/prompt';

// Explicações detalhadas para cada modelo de card.
export const CARD_EXPLANATIONS: Record<CardModel, string> = {
  'Básico': 'Formato simples de Pergunta;Resposta (Frente;Verso).',
  'Invertido': 'Formato de Pergunta;Resposta, mas a IA deve criar questões que funcionem bem se as cartas forem invertidas (Verso;Frente).',
  'Escrita': 'Formato de Pergunta;Resposta, onde a "Resposta" deve ser uma palavra ou frase concisa para digitação.',
  'Ocultação (Cloze)': 'A IA deve usar a sintaxe do Anki para ocultação de palavras: "Texto com {{c1::palavra oculta}}". O formato final deve ser: Texto com Ocultação{{DELIMITADOR}}Verso Extra{{DELIMITADOR}}Tags.',
};

// Opções para a seleção do delimitador CSV.
export const DELIMITER_OPTIONS: { value: Delimiter; label: string }[] = [
  { value: ';', label: 'Ponto e Vírgula (;)' },
  { value: '|', label: 'Pipe (|)' },
  { value: '//', label: 'Barra Dupla (//)' },
];

// Opções para a inclusão da coluna de Tags.
export const TAGS_OPTIONS: { value: TagsOption; label: string }[] = [
  { value: 'Sim', label: 'Sim (Recomendado)' },
  { value: 'Não', label: 'Não' },
];

// Texto base do prompt que contém variáveis a serem substituídas.
// A formatação é mantida aqui, garantindo que o código não precise de templates complexos.
export const DEFAULT_PROMPT_BASE = `
A partir de agora e durante toda essa conversa atue como um Especialista em Aprendizagem e Flashcards (Anki).
Seu objetivo é converter o texto que eu enviar em flashcards otimizados para memorização ativa e repetição espaçada.

REGRAS DE FORMATAÇÃO (CRÍTICO):
1. A saída deve ser exclusivamente um bloco de código (tabela).
2. O formato de saída deve ser compatível com importação CSV.
3. O delimitador de colunas DEVE ser o {{DELIMITADOR}}.
4. **IMPORTANTE:** Se a coluna "Tags" for incluída, as tags individuais dentro dessa coluna devem ser separadas por **espaço** ou **vírgula** (ex: Tag1,Tag2 ou Tag1 Tag2).
5. Não utilize ";" a não ser que seja o {{DELIMITADOR}}.

FORMATO:
{{FORMATO_FINAL}}

INSTRUÇÃO DE GERAÇÃO:
* O formato das questões deve ser: {{MODELO_DE_CARD}}.
* Que consiste em: {{EXPLICACAO_MODELO}}
* {{INSTRUCAO_ESPECIFICA_CLOZE}}
* Se houver necessidade de usar o delimitador dentro das perguntas ou respostas, utilize o caractere de escape: "\\{{DELIMITADOR}}" antes dele.
* Gere os flashcards em Português Brasileiro

CONTEÚDO:
Se não for instruído quantos flashcards devem ser gerados, garanta que há flashcards suficientes para abordar o ponto central do conteúdo (mínimo 5).

\n\n[COLE SEU MATERIAL AQUI]
`;