import React, { useState } from 'react';
import PromptCard from './PromptCard';
import PromptSelect from '@/components/screens/Prompts/PromptSelect';
import { Separator } from '@/components/ui/separator';
import type { CardModel, Delimiter, TagsOption } from '@/types/prompt';
import {
	DELIMITER_OPTIONS,
	TAGS_OPTIONS,
	CARD_EXPLANATIONS,
} from '@/data/promptDefinitions';
import { usePromptBuilder } from '@/hooks/usePromptBuilder';

export const SuggestedPrompts: React.FC = () => {
	// --- Estados ---
	const [cardModel, setCardModel] = useState<CardModel>('Básico');
	const [delimiter, setDelimiter] = useState<Delimiter>(';');
	const [includeTags, setIncludeTags] = useState<TagsOption>('Sim');

	// --- Lógica de Geração do Prompt (Extraída para o Hook) ---
	const { generatedPrompt } = usePromptBuilder({
		cardModel,
		delimiter,
		includeTags,
	});

	// O componente agora foca na montagem da UI usando o PromptSelect genérico.
	return (
		<div className="p-6 max-w-6xl scrollbar-hide mx-auto">
			{/* Cabeçalho */}
			<h1 className="text-3xl font-bold mb-5 text-foreground">Gerador de Prompt Personalizado</h1>
			<Separator className="mb-6" />

			{/* Controles de Configuração */}
			<h2 className="text-xl font-semibold mb-2 text-foreground">Configurações do Prompt</h2>
			<p className="text-sm text-muted-foreground mb-6">Defina as configurações que irão compor o gerador de flashcards.</p>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 p-4">
				{/* 1. Modelo de Card */}
				<PromptSelect
					id="card-model"
					label="Modelo de Card"
					value={cardModel}
					options={Object.keys(CARD_EXPLANATIONS).map((model) => ({
						value: model,
						label: model,
					}))}
					onValueChange={(value) => setCardModel(value as CardModel)}
				/>

				{/* 2. Delimitador */}
				<PromptSelect
					id="delimiter"
					label="Delimitador CSV"
					value={delimiter}
					options={DELIMITER_OPTIONS}
					onValueChange={(value) => setDelimiter(value as Delimiter)}
				/>

				{/* 3. Tags */}
				<PromptSelect
					id="include-tags"
					label="Incluir Coluna de Tags"
					value={includeTags}
					options={TAGS_OPTIONS}
					onValueChange={(value) => setIncludeTags(value as TagsOption)}
				/>
			</div>

			<Separator className="mb-6" />

			{/* Nota de rodapé (simplificada) */}
			<div className="my-8 p-4 bg-secondary text-secondary-foreground rounded-lg border border-border">
				<h3 className="font-semibold mb-1">Dica de Uso</h3>
				<p className="text-sm">
					Copie o prompt abaixo e cole no campo de texto da sua IA, seguido pelo conteúdo (texto, anotações ou código) que você deseja converter em flashcards.
				</p>
			</div>

			{/* Prompt Gerado Dinamicamente */}
			<PromptCard
				title="Prompt Otimizado"
				model={cardModel}
				delimiter={delimiter}
				tag={includeTags}
				promptText={generatedPrompt}
			/>
		</div>
	);
};