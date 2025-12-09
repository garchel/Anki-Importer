import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Check, HeartHandshake } from 'lucide-react';

interface SupportSectionProps {
	pixKey: string;
}

// Componente responsável pela lógica de cópia da chave Pix e sua interface (SRP).
const SupportSection: React.FC<SupportSectionProps> = ({ pixKey }) => {
	const [copied, setCopied] = useState(false);

	// Função para copiar a chave Pix, encapsulando a lógica de estado de feedback.
	const copyPixKeyToClipboard = useCallback(() => {
		navigator.clipboard.writeText(pixKey);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	}, [pixKey]);

	return (
		<div className="text-center p-4 bg-yellow-50/50 dark:bg-yellow-900/10 border border-border rounded-lg shadow-inner">
			<h3 className="text-xl font-semibold mb-2 flex items-center justify-center gap-2 text-yellow-600 dark:text-yellow-400">
				<HeartHandshake className="w-5 h-5" /> Apoie o Desenvolvimento
			</h3>
			<p className="text-sm text-muted-foreground mb-3">
				Este projeto é de código aberto. Se você gostou da ferramenta e deseja contribuir com o desenvolvimento:
			</p>
			<div className="inline-flex items-center bg-input p-3 rounded-md border border-dashed border-primary/50">
				<span className="font-mono text-sm text-foreground select-text mr-3">{pixKey}</span>
				<Button
					onClick={copyPixKeyToClipboard}
					variant="ghost"
					size="icon"
					className="h-8 w-8 text-primary hover:bg-primary/10 hover:text-orange-500"
					title="Copiar Chave Pix"
				>
					{copied ? (
						<Check className="h-4 w-4 text-green-500" />
					) : (
						<Copy className="h-4 w-4" />
					)}
				</Button>
			</div>
			<p className="mt-2 text-xs text-secondary-foreground">Chave Pix (Copie e cole no seu banco)</p>
		</div>
	);
};

export default SupportSection;