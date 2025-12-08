// AnkiConnectConfigCard.tsx

import React, { useCallback, useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Check, Terminal } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';


const useLocalIp = () => {
	// 127.0.0.1 é a referência segura de IP local
	const localIp = '127.0.0.1';
	return { localIp };
};


export const AnkiConnectConfigCard: React.FC = () => {
	const [copied, setCopied] = useState(false);
	const { localIp } = useLocalIp();
	const [isGenerated, setIsGenerated] = useState(false);

	// Gera o JSON de configuração OTIMIZADO
	const configJson = useMemo(() => {
		return JSON.stringify({
			// Campos definidos como null (como na sua versão funcional)
			"apiKey": null,
			"apiLogPath": null,
			"ignoreOriginList": [],

			"webBindAddress": localIp,
			"webBindPort": 8765,

			// Chave correta para a lista de origens CORS (webCorsOriginList)
			"webCorsOriginList": [
				"http://localhost",
				"http://localhost:5173", // Necessário para testes em Dev (Vite)
				"file://" // Essencial para o Electron em Prod
			]
			// Removidas as chaves "apiKeys", "apiUrl" e "webCorsOrigin" pois são redundantes ou não utilizadas
		}, null, 4);
	}, [localIp]);


	const handleCopy = useCallback(() => {
		if (!isGenerated) return;
		navigator.clipboard.writeText(configJson);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000); // Resetar após 2 segundos
	}, [configJson, isGenerated]);

	const handleGenerate = () => {
		setIsGenerated(true);
	};

	return (
		<Card className="shadow-lg border-primary/50">
			<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle className="text-xl font-bold flex items-center gap-2">
					<Terminal className="w-5 h-5 text-primary" />
					Configuração do Anki Connect
				</CardTitle>
				<CardDescription className="text-sm">IP Local: <span className="font-semibold text-foreground">{localIp}</span></CardDescription>
			</CardHeader>

			<CardContent>
				<p className="text-sm text-muted-foreground mb-4">
					Pressione <span className='font-bold text-gray-300'>Gerar</span> para obter a configuração do AnkiConnect. Copie e cole este texto no arquivo de configuração.
				</p>

				{isGenerated ? (
					<div className="relative p-3 mb-4 bg-input rounded-md text-sm font-mono whitespace-pre-wrap break-words border border-border">
						{configJson}
						<Button
							onClick={handleCopy}
							variant="ghost"
							size="icon"
							className="absolute top-2 right-2 h-8 w-8 text-primary hover:bg-primary/10"
							title="Copiar Configuração"
						>
							{copied ? (
								<Check className="h-4 w-4 text-green-500" />
							) : (
								<Copy className="h-4 w-4" />
							)}
						</Button>
					</div>
				) : (
					<Button
						onClick={handleGenerate}
						className="w-full bg-primary hover:bg-primary/90 transition-all"
						size="lg"
					>
						Gerar Configuração Otimizada
					</Button>
				)}

				<p className="mt-4 text-xs text-secondary-foreground bg-primary/10 p-2 rounded-md border border-primary/20">
					A lista de origens <span className='font-bold text-gray-300'>(`webCorsOriginList`)</span> inclui  o protocolo <span className='font-bold text-gray-300'>`file://`</span> para garantir a conexão.
				</p>
			</CardContent>
		</Card>
	);
}