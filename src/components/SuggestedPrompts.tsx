import React from 'react';
import PromptCard from './PromptCard';

// Lista de Prompts de exemplo para Flashcards
const suggestedPromptsData = [
	{
		title: 'Flashcards de Resposta Curta (Conceito)',
		description: 'Ideal para definir termos-chave, conceitos e fórmulas. Solicita o formato simples de pergunta/resposta.',
		promptText: `Eu vou te fornecer um texto sobre um tópico. Sua tarefa é extrair dele 10 flashcards no formato CSV, com três colunas: Frente, Verso e Tags.
Siga estritamente o formato: \nFrente;Verso;Tags\n
Exemplo: Qual é o ciclo de vida do componente React?;Mounting, Updating e Unmounting;React,Frontend
\n\nAgora, extraia flashcards do seguinte texto:\n\n[COLE SEU TEXTO AQUI]`,
	},
	{
		title: 'Flashcards de Código (Programação)',
		description: 'Perfeito para memorizar trechos de código ou a sintaxe de comandos específicos de linguagens de programação.',
		promptText: `A partir do trecho de código ou documentação que fornecerei, crie 8 flashcards no formato CSV, focando em exemplos de sintaxe e suas explicações.
Use o formato: \nFrente (Trecho de código);Verso (Explicação e Saída Esperada);Tags (Linguagem, Tópico)
\n\nTexto/Código para análise:\n\n[COLE SEU CÓDIGO AQUI]`,
	},
	{
		title: 'Flashcards de Múltipla Escolha (Revisão Rápida)',
		description: 'Cria flashcards no formato "Frente: Pergunta com Opções / Verso: Resposta Correta e Explicação", bom para revisão ativa.',
		promptText: `Crie 15 flashcards de revisão no formato CSV com as seguintes colunas: Pergunta + Opções, Resposta Completa, Tópico.
Formato: \nFrente;Verso;Tags\n
Foco em conceitos complexos e diferenciações.
\n\nFonte do Material:\n\n[COLE SEU MATERIAL AQUI]`,
	},
];

export const SuggestedPrompts: React.FC = () => {
	return (
		<div className="p-6">

			{/* Cabeçalho */}
			<h1 className="text-3xl font-extrabold mb-2 text-foreground">💡 Prompts Sugeridos para IAs</h1>
			<p className="text-lg text-muted-foreground mb-6">
				Use estes prompts no **ChatGPT, Gemini, Claude ou outra IA** para gerar flashcards no formato CSV/texto, prontos para copiar e colar no Importer.
			</p>

			{/* Grade de Prompts */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{suggestedPromptsData.map((prompt, index) => (
					<PromptCard
						key={index}
						title={prompt.title}
						description={prompt.description}
						promptText={prompt.promptText}
					/>
				))}
			</div>

			{/* Nota de rodapé */}
			<div className="mt-8 p-4 bg-secondary text-secondary-foreground rounded-lg border border-border">
				<h3 className="font-semibold mb-1">Dica de Produtividade</h3>
				<p className="text-sm">
					Sempre inclua na parte inferior do prompt o texto:
					<code className="bg-secondary/50 p-1 rounded font-mono text-primary">"Siga estritamente o formato: Frente;Verso;Tags"</code>
					para garantir que a IA produza a saída correta para importação.
				</p>
			</div>
		</div>
	);
};