import React, { useCallback, useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Check, Terminal } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLocalIp } from '@/hooks/useLocalIp';

// Define a porta padrão do Anki Connect para evitar números mágicos no código.
const ANKI_CONNECT_PORT = 8765;

// Estrutura de configuração otimizada para o Anki Connect.
// Esta configuração é projetada para funcionar tanto em ambiente de desenvolvimento (localhost/Vite)
// quanto em ambiente de produção (Electron/file://).
interface AnkiConnectConfig {
	apiKey: null;
	apiLogPath: null;
	ignoreOriginList: string[];
	webBindAddress: string;
	webBindPort: number;
	webCorsOriginList: string[];
}

export const AnkiConnectConfigCard: React.FC = () => {
	const [copied, setCopied] = useState(false);
	const { localIp } = useLocalIp();
	const [isConfigurationGenerated, setIsConfigurationGenerated] = useState(false);

	// Usa useMemo para garantir que o JSON de configuração seja gerado uma única vez
	// e apenas quando as dependências (localIp) mudarem, otimizando o desempenho.
	const configurationJson = useMemo(() => {
		const config: AnkiConnectConfig = {
			// Estes campos são mantidos como 'null' conforme a necessidade do Anki Connect
			"apiKey": null,
			"apiLogPath": null,
			"ignoreOriginList": [],

			"webBindAddress": localIp,
			"webBindPort": ANKI_CONNECT_PORT,

			// Lista de origens permitidas para requisições CORS.
			"webCorsOriginList": [
				"http://localhost",
				"http://localhost:5173", // Necessário para ambiente de desenvolvimento (Vite)
				"file://" // Essencial para o protocolo Electron em produção
			]
		};

		// Formata o objeto JSON com indentação de 4 espaços para legibilidade.
		return JSON.stringify(config, null, 4);
	}, [localIp]);

	// Função para copiar a configuração JSON para a área de transferência.
	const copyConfigurationToClipboard = useCallback(() => {
		// Proíbe a cópia se a configuração ainda não foi exibida/gerada.
		if (!isConfigurationGenerated) return;

		navigator.clipboard.writeText(configurationJson);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	}, [configurationJson, isConfigurationGenerated]);

	// Função para iniciar a geração da configuração e exibi-la.
	const generateConfiguration = useCallback(() => {
		setIsConfigurationGenerated(true);
	}, []);

	return (
		<Card className="shadow-lg border-primary/50">
			<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle className="text-xl font-bold flex items-center gap-2">
					<Terminal className="w-5 h-5 text-primary" />
					Configuração do Anki Connect
				</CardTitle>
				<CardDescription className="text-sm">
					Endereço Local: <span className="font-semibold text-foreground">{localIp}</span>
				</CardDescription>
			</CardHeader>

			<CardContent>
				<p className="text-sm text-muted-foreground mb-4">
					Pressione <span className='font-bold text-gray-300'>Gerar</span> para obter a configuração do AnkiConnect. Copie e cole este texto no arquivo de configuração do plugin.
				</p>

				{isConfigurationGenerated ? (
					<div className="relative p-3 mb-4 bg-input rounded-md text-sm font-mono whitespace-pre-wrap break-words border border-border">
						{configurationJson}
						{/* Botão de Copiar */}
						<Button
							onClick={copyConfigurationToClipboard}
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
					/* Botão de Geração */
					<Button
						onClick={generateConfiguration}
						className="w-full bg-primary hover:bg-primary/90 transition-all"
						size="lg"
					>
						Gerar Configuração Otimizada
					</Button>
				)}

				<p className="mt-4 text-xs text-secondary-foreground bg-primary/10 p-2 rounded-md border border-primary/20">
					A lista de origens <span className='font-bold text-gray-300'>(`webCorsOriginList`)</span> inclui o protocolo <span className='font-bold text-gray-300'>`file://`</span> para garantir a conexão em aplicativos nativos (como o Electron).
				</p>
			</CardContent>
		</Card>
	);
}