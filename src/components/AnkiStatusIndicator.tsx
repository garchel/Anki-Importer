// src/components/AnkiStatusIndicator.tsx
import {
	Tooltip,
	TooltipTrigger,
	TooltipContent,
	TooltipProvider,
} from "@/components/ui/tooltip";

interface AnkiStatusIndicatorProps {
	isLoading: boolean;
	error: string | null;
	isConnected: boolean;
}

export const AnkiStatusIndicator: React.FC<AnkiStatusIndicatorProps> = ({ isLoading, error, isConnected }) => {
	let statusIcon: string;
	let statusText: string;

	if (isLoading) {
		statusIcon = '🔄';
		statusText = 'Carregando... Verifique se o Anki está aberto.';
	} else if (error && !isConnected) {
		statusIcon = '🔴';
		statusText = `Falha na Conexão. Erro: ${error}. O Anki está rodando?`;
	} else if (isConnected) {
		statusIcon = '🟢';
		statusText = 'Conexão com o Anki: Conectado.';
	} else {
		// Fallback: Conexão não confirmada, mas sem erro.
		statusIcon = '🟡';
		statusText = 'Verificando status do Anki...';
	}

	// Visual Minimalista: (Status: 🟢)
	const display = `Status: ${statusIcon}`;

	// A TooltipProvider é necessária para usar a Tooltip. Assumimos que o ImporterForm 
	// já a fornece, mas para segurança, vou adicioná-la aqui.
	// Recomenda-se mover a TooltipProvider para um nível superior, se possível.
	return (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger>
					<span className="text-sm font-medium cursor-default inline-flex items-center p-1 px-3 rounded-md border border-border hover:bg-muted transition-colors">
						{display}
					</span>
				</TooltipTrigger>
				<TooltipContent className="bg-popover text-popover-foreground border-border max-w-sm">
					<p>{statusText}</p>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
};