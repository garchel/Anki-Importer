import React, { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';

interface PromptCardProps {
	title: string;
	model: string;
	delimiter: string;
	tag: string;
	promptText: string;
}

const PromptCard: React.FC<PromptCardProps> = ({ title, model, delimiter, tag, promptText }) => {
	const [copied, setCopied] = useState(false);

	const handleCopy = useCallback(() => {
		navigator.clipboard.writeText(promptText);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000); // Resetar após 2 segundos
	}, [promptText]);

	return (
		<div className="bg-card p-4 rounded-lg border border-border transition-shadow duration-200 hover:shadow-lg">

			{/* Título e Descrição */}
			<h3 className="text-xl font-semibold mb-2 text-foreground">{title}</h3>
			<p className="text-sm text-muted-foreground mb-4">
				Modelo: <span className="font-bold text-blue-400">{model}</span> |
				Delimitador: <span className="font-bold text-blue-400">{delimiter}</span> |
				Tags: <span className="font-bold text-blue-400">{tag}</span>
			</p>

			{/* Área de Visualização do Prompt */}
			<div className="relative p-3 mb-4 bg-input rounded-md text-sm font-mono whitespace-pre-wrap break-words border border-border">
				{promptText}

				{/* Botão de Copiar */}
				<Button
					onClick={handleCopy}
					variant="ghost"
					size="icon"
					className="absolute top-2 right-2 h-8 w-8 text-primary hover:bg-primary/10"
					title="Copiar Prompt"
				>
					{copied ? (
						<Check className="h-4 w-4 text-green-500" />
					) : (
						<Copy className="h-4 w-4" />
					)}
				</Button>
			</div>

			{/* Aviso de Formato */}
			<p className="text-xs text-primary/80 mt-2">
				⚠️ <span className='font-bold'>Ajuste o Formato:</span> Verifique se os campos de saída da IA (`Frente;Verso;Tags`) correspondem ao seu modelo de nota do Anki.
			</p>
		</div>
	);
};

export default PromptCard;
