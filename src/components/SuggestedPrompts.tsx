import React, { useState, useMemo } from 'react';
import PromptCard from './PromptCard';
import { Label } from '@/components/ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'; // Importação completa e correta do Select

// --- Definições ---
type CardModel = 'Básico' | 'Invertido' | 'Ocultação (Cloze)' | 'Escrita';
type Delimiter = ';' | '|' | '//';
type TagsOption = 'Sim' | 'Não';

// Explicações para o corpo do prompt (Variáveis de acordo com a seleção)
const cardExplanations: Record<CardModel, string> = {
	'Básico': 'Formato simples de Pergunta;Resposta (Frente;Verso).',
	'Invertido': 'Formato de Pergunta;Resposta, mas a IA deve criar questões que funcionem bem se as cartas forem invertidas (Verso;Frente).',
	'Escrita': 'Formato de Pergunta;Resposta, onde a "Resposta" deve ser uma palavra ou frase concisa para digitação.',
	'Ocultação (Cloze)': 'A IA deve usar a sintaxe do Anki para ocultação de palavras: "Texto com {{c1::palavra oculta}}". O formato final deve ser apenas o texto com a ocultação.'
};

const defaultPromptBase = `
A partir de agora e durante toda essa conversa atue como um Especialista em Aprendizagem e Flashcards (Anki).
Seu objetivo é converter o texto que eu enviar em flashcards otimizados para memorização ativa e repetição espaçada.

REGRAS DE FORMATAÇÃO (CRÍTICO):
1. A saída deve ser exclusivamente um bloco de código.
2. O formato de saída deve ser compatível com importação CSV.
3. O delimitador de colunas DEVE ser o {{DELIMITADOR}}.

FORMATO:
{{FORMATO_FINAL}}

INSTRUÇÃO DE GERAÇÃO:
* O formato das questões deve ser: {{MODELO_DE_CARD}}.
* Que consiste em: {{EXPLICACAO_MODELO}}
* Se houver necessidade de usar o delimitador dentro das perguntas ou respostas, utilize o caractere de escape: "\\{{DELIMITADOR}}" antes dele.

CONTEÚDO:
Se não for instruído quantos flashcards devem ser gerados, garanta que há flashcards suficientes para abordar o ponto central do conteúdo (mínimo 5).

\n\n[COLE SEU MATERIAL AQUI]
`;

const DELIMITER_OPTIONS: { value: Delimiter; label: string }[] = [
	{ value: ';', label: 'Ponto e Vírgula (;)' },
	{ value: '|', label: 'Pipe (|)' },
	{ value: '//', label: 'Barra Dupla (//)' },
];

const TAGS_OPTIONS: { value: TagsOption; label: string }[] = [
	{ value: 'Sim', label: 'Sim (Recomendado)' },
	{ value: 'Não', label: 'Não' },
];


export const SuggestedPrompts: React.FC = () => {
	// --- Estados ---
	const [cardModel, setCardModel] = useState<CardModel>('Básico');
	const [delimiter, setDelimiter] = useState<Delimiter>(';');
	const [includeTags, setIncludeTags] = useState<TagsOption>('Sim');

	// --- Lógica de Geração do Prompt ---
	const generatedPrompt = useMemo(() => {
		// 1. Define o Formato Final (colunas)
		const formatParts = [];
		if (cardModel === 'Ocultação (Cloze)') {
			formatParts.push('Texto com Ocultação');
		} else {
			formatParts.push('Frente', 'Verso');
		}

		if (includeTags === 'Sim') {
			formatParts.push('Tags');
		}

		const finalFormat = formatParts.join(delimiter);

		// 2. Substitui as Variáveis no Prompt Base
		let prompt = defaultPromptBase;

		prompt = prompt.replace('{{DELIMITADOR}}', delimiter);
		prompt = prompt.replace('{{FORMATO_FINAL}}', finalFormat);
		prompt = prompt.replace('{{MODELO_DE_CARD}}', cardModel);
		prompt = prompt.replace('{{EXPLICACAO_MODELO}}', cardExplanations[cardModel]);

		// Manipulação do escape
		if (delimiter === ';') {
			prompt = prompt.replace('\\{{DELIMITADOR}}', '\\;');
		} else {
			prompt = prompt.replace('\\{{DELIMITADOR}}', `\\${delimiter}`);
		}

		return prompt.trim(); // Remove espaço extra do início/fim
	}, [cardModel, delimiter, includeTags]);

	// O componente SuggestedPrompts agora renderiza o gerador dinâmico
	return (
		<div className="p-6 max-w-6xl scrollbar-hide mx-auto">

			{/* Cabeçalho */}
			<h1 className="text-3xl font-bold mb-5 text-foreground">Gerador de Prompt Personalizado</h1>

			<hr className="mb-6 border-border" />

			{/* Controles de Configuração */}
			<h2 className="text-xl font-semibold mb-2 text-foreground">Configurações do Prompt</h2>
			<p className="text-sm text-muted-foreground mb-6">Defina as configurações que irão compor o gerador de flashcards</p>
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8  p-4 ">

				{/* 1. Modelo de Card */}
				<div className="flex flex-col space-y-2">
					<Label htmlFor="card-model" className="font-semibold">Modelo de Card</Label>
					<Select
						value={cardModel}
						onValueChange={(value) => setCardModel(value as CardModel)}
					>
						<SelectTrigger id="card-model" className="w-full bg-input">
							<SelectValue placeholder="Selecione o Modelo" />
						</SelectTrigger>
						<SelectContent>
							{Object.keys(cardExplanations).map((model) => (
								<SelectItem key={model} value={model}>
									{model}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				{/* 2. Delimitador */}
				<div className="flex flex-col space-y-2">
					<Label htmlFor="delimiter" className="font-semibold">Delimitador CSV</Label>
					<Select
						value={delimiter}
						onValueChange={(value) => setDelimiter(value as Delimiter)}
					>
						<SelectTrigger id="delimiter" className="w-full bg-input">
							<SelectValue placeholder="Selecione o Delimitador" />
						</SelectTrigger>
						<SelectContent>
							{DELIMITER_OPTIONS.map((opt) => (
								<SelectItem key={opt.value} value={opt.value}>
									{opt.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				{/* 3. Tags */}
				<div className="flex flex-col space-y-2">
					<Label htmlFor="include-tags" className="font-semibold">Incluir Coluna de Tags</Label>
					<Select
						value={includeTags}
						onValueChange={(value) => setIncludeTags(value as TagsOption)}
					>
						<SelectTrigger id="include-tags" className="w-full bg-input">
							<SelectValue placeholder="Incluir Tags?" />
						</SelectTrigger>
						<SelectContent>
							{TAGS_OPTIONS.map((opt) => (
								<SelectItem key={opt.value} value={opt.value}>
									{opt.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			</div>

			<hr className="mb-6 border-border" />

			{/* Prompt Gerado Dinamicamente */}
			<PromptCard
				title="Prompt Otimizado"
				model={`${cardModel}`}
				delimiter={`${delimiter}`}
				tag={`${includeTags}`}
				//description={`Modelo: ${cardModel} | Delimitador: ${delimiter} | Tags: ${includeTags}`}
				promptText={generatedPrompt}
			/>

			{/* Nota de rodapé (simplificada) */}
			<div className="mt-8 p-4 bg-secondary text-secondary-foreground rounded-lg border border-border">
				<h3 className="font-semibold mb-1">Dica de Uso</h3>
				<p className="text-sm">
					Copie o prompt acima e cole no campo de texto da sua IA, seguido pelo conteúdo (texto, anotações ou código) que você deseja converter em flashcards.
				</p>
			</div>
		</div>
	);
};