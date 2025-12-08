import React from 'react';
import { useState, useEffect } from 'react';
import { useSettings } from './context/SettingsContext';
import type {
	FieldDelimiter,
	AllowedModel,
} from './context/SettingsContext';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import type { CheckedState } from '@radix-ui/react-checkbox';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const WINDOW_RESOLUTIONS = [
	{ width: 800, height: 600, label: 'Pequena' },
	{ width: 1024, height: 768, label: 'Média' },
	{ width: 1280, height: 800, label: 'Grande' },
	{ width: 1440, height: 900, label: 'Extra Grande' },
];

const DELIMITER_OPTIONS: { value: FieldDelimiter; label: string }[] = [
	{ value: ';', label: ';  (Ponto e Vírgula)' },
	{ value: '|', label: '|  (Pipe)' },
	{ value: '//', label: '//  (Barras Duplas)' },
];

const MODIFIER_OPTIONS = [
	{ value: 'Control', label: 'Control/Command' },
	{ value: 'Alt', label: 'Alt' },
	{ value: 'Shift', label: 'Shift' },
];


const SettingsScreen: React.FC = () => {
	// --- HOOK DO CONTEXTO REAL ---
	const { settings, updateSettings, ankiData } = useSettings();
	const { deckNames, modelNames, isLoading, error: ankiError, isConnected, loadAnkiData } = ankiData;
	const currentShortcutParts = settings.globalShortcut.split('+');
	const initialModifier = currentShortcutParts.length > 1 ? currentShortcutParts[0] : 'Control';
	const initialKey = currentShortcutParts.length > 1 ? currentShortcutParts[1] : 'G';
	const [shortcutModifier, setShortcutModifier] = useState(initialModifier);
	const [shortcutKey, setShortcutKey] = useState(initialKey);

	// Sincroniza estados locais com o estado global ao carregar
	useEffect(() => {
		const parts = settings.globalShortcut.split('+');
		setShortcutModifier(parts.length > 1 ? parts[0] : 'Control');
		setShortcutKey(parts.length > 1 ? parts[1] : 'G');
	}, [settings.globalShortcut]);

	// Função de salvamento (disparada pelo botão de salvar)
	const handleSaveShortcut = () => {
		const newShortcut = `${shortcutModifier}+${shortcutKey.toUpperCase()}`;
		updateSettings({ globalShortcut: newShortcut });
	};

	// Função de redefinição
	const handleResetShortcut = () => {
		// O padrão é Control+G, que o Electron irá converter para Command+G no macOS.
		const defaultShortcut = 'Control+G';
		setShortcutModifier('Control');
		setShortcutKey('G');
		updateSettings({ globalShortcut: defaultShortcut });
	};


	// Handler para alternar Modelos Permitidos
	const handleModelToggle = (model: AllowedModel, checked: CheckedState) => {
		if (checked === 'indeterminate') return;

		const newAllowedModels = checked
			? [...settings.allowedModels, model]
			: settings.allowedModels.filter(m => m !== model);

		updateSettings({ allowedModels: newAllowedModels });
	};

	// Handler para mudar Delimitador do Programa (Field Delimiter)
	const handleProgramDelimiterChange = (value: string) => {
		updateSettings({ fieldDelimiter: value as FieldDelimiter });
	};

	// Handler para mudar Delimitador do Anki (Anki Delimiter)
	const handleAnkiDelimiterChange = (value: string) => {
		updateSettings({ ankiDelimiter: value as FieldDelimiter });
	};


	// Handler para mudar Resolução da Janela (Preset)
	const handleResolutionChange = (value: string) => {
		// O valor "custom" não deve mais ser uma opção válida no Select,
		// mas mantemos o if para segurança.
		if (value === 'custom') return;

		const [width, height] = value.split('x').map(Number);
		if (!isNaN(width) && !isNaN(height)) {
			// A atualização do Electron é disparada pelo useEffect no SettingsProvider
			updateSettings({ windowWidth: width, windowHeight: height });
		}
	};

	// Handler para mudar o Deck Padrão via Select
	const handleDefaultDeckChange = (value: string) => {
		updateSettings({ defaultDeck: value });
	};


	// --- LÓGICA DO "PERSONALIZADO" ---
	// O select agora só deve mostrar presets. A opção "Personalizado" é removida da lógica do Select.
	const currentResString = `${settings.windowWidth}x${settings.windowHeight}`;
	const isPreset = WINDOW_RESOLUTIONS.some(
		res => `${res.width}x${res.height}` === currentResString
	);

	// O valor do select deve ser o preset atual ou o primeiro preset, pois não há mais "custom" válido.
	const selectValue = isPreset ? currentResString : `${WINDOW_RESOLUTIONS[0].width}x${WINDOW_RESOLUTIONS[0].height}`;

	return (
		<div className="p-6 max-w-6xl scrollbar-hide mx-auto">
			<h1 className="text-3xl font-bold text-foreground mb-5 flex items-center">
				Configurações
			</h1>
			<hr className="mb-6 border-border" />

			{/* <p className="mt-4 text-muted-foreground mb-3">
				Ajuste as preferências do aplicativo e os valores padrão de importação.
			</p>*/}

			{/* Exibição de Erros do Anki */}
			{ankiError && (
				<div className="p-4 mb-4 bg-destructive/20 text-destructive rounded-md font-medium border border-destructive/50">
					⚠️ Erro de Conexão: {ankiError}
					<button onClick={loadAnkiData} className="ml-2 underline hover:no-underline font-bold">Tentar Recarregar?</button>
				</div>
			)}

			<div className="space-y-10">

				{/* --- 1. CONFIGURAÇÕES DA JANELA --- */}
				<section>
					<h2 className="text-xl font-semibold text-foreground mb-2">Tamanho da Janela</h2>
					<p className="text-sm text-muted-foreground mb-6">
						Selecione o tamanho padrão da janela.
					</p>

					<div className="max-w-xs">
						<Label htmlFor="resolution" className="text-sm font-medium leading-none mb-1 block">Resolução</Label>
						<Select
							value={selectValue}
							onValueChange={handleResolutionChange}
						>
							<SelectTrigger id="resolution" className="w-full bg-input">
								<SelectValue placeholder="Selecione a Resolução" />
							</SelectTrigger>
							<SelectContent>
								{WINDOW_RESOLUTIONS.map(({ width, height, label }) => (
									<SelectItem key={`${width}x${height}`} value={`${width}x${height}`}>
										{label} ({width}x{height})
									</SelectItem>
								))}
								{/* REMOVIDO: Opção "Personalizado" */}
							</SelectContent>
						</Select>
					</div>
				</section>

				<Separator />

				{/* --- 2. VALORES PADRÃO DE IMPORTAÇÃO --- */}
				<section>
					<h2 className="text-xl font-semibold text-foreground mb-2">Padrões de Importação</h2>
					<p className="text-sm text-muted-foreground mb-1">
						Selecione as configurações de importação padrão.
					</p>
					<p className="text-sm text-muted-foreground mb-6">
						Continuará sendo possível trocar a qualquer momento na tela de importação
					</p>

					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg">

						{/* SELECT PARA DECK PADRÃO */}
						<div>
							<Label htmlFor="defaultDeck" className="text-sm font-medium leading-none mb-1 block">Deck Padrão</Label>
							<Select
								value={settings.defaultDeck}
								onValueChange={handleDefaultDeckChange}
								disabled={isLoading || ankiError !== null}
							>
								<SelectTrigger id="defaultDeck" className="w-full bg-input">
									<SelectValue placeholder={isLoading ? 'Carregando decks...' : (ankiError || 'Selecione o Deck Padrão')} />
								</SelectTrigger>
								<SelectContent>
									{ankiError && (
										<SelectItem value="error" disabled>{ankiError}</SelectItem>
									)}
									{deckNames.map((deck) => (
										<SelectItem key={deck} value={deck}>
											{deck}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						{/* SELECT PARA TIPO DE NOTA PADRÃO */}
						<div>
							<Label htmlFor="defaultModel" className="text-sm font-medium leading-none mb-1 block">Tipo de Nota Padrão</Label>
							<Select
								value={settings.defaultModel}
								onValueChange={(value) => updateSettings({ defaultModel: value as AllowedModel })}
								disabled={isLoading || ankiError !== null}
							>
								<SelectTrigger id="defaultModel" className="w-full bg-input">
									<SelectValue placeholder={isLoading ? 'Carregando modelos...' : (ankiError || 'Selecione o Tipo de Nota')} />
								</SelectTrigger>
								<SelectContent>
									{ankiError && (
										<SelectItem value="error" disabled>{ankiError}</SelectItem>
									)}
									{modelNames.map((model) => (
										<SelectItem key={model} value={model}>
											{model}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>
				</section>

				<Separator />

				{/* --- 3. DELIMITADORES --- */}
				<section>
					<h2 className="text-xl font-semibold text-foreground mb-3">Delimitadores de Campo</h2>
					<p className="text-sm text-muted-foreground mb-7">
						Defina o delimitador usado no seu texto de entrada e o delimitador configurado no seu Anki.
					</p>
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
						{/* Delimitador USADO PELO PROGRAMA (ENTRADA) */}
						<div>
							<Label htmlFor="programDelimiter" className="text-sm font-medium leading-none mb-2 block">Delimitador do <span className='font-bold text-blue-400'>Programa</span></Label>
							<Select
								value={settings.fieldDelimiter}
								onValueChange={handleProgramDelimiterChange}
							>
								<SelectTrigger id="programDelimiter" className="w-full bg-input">
									<SelectValue placeholder="Selecione o Delimitador" />
								</SelectTrigger>
								<SelectContent>
									{DELIMITER_OPTIONS.map(opt => (
										<SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
									))}
								</SelectContent>
							</Select>
							<p className="mt-2 text-xs text-muted-foreground">
								Este é o delimitador usado no texto que você cola.
							</p>
						</div>

						{/* Delimitador CONFIGURADO NO ANKI (SAÍDA) */}
						<div>
							<Label htmlFor="ankiDelimiter" className="text-sm font-medium leading-none mb-2 block">Delimitador do <span className='font-bold text-blue-400'>Anki</span></Label>
							<Select
								value={settings.ankiDelimiter}
								onValueChange={handleAnkiDelimiterChange}
							>
								<SelectTrigger id="ankiDelimiter" className="w-full bg-input">
									<SelectValue placeholder="Selecione o Delimitador" />
								</SelectTrigger>
								<SelectContent>
									{DELIMITER_OPTIONS.map(opt => (
										<SelectItem
											key={opt.value}
											value={opt.value}
											// Desabilita e adiciona o aviso para opções que não são o Ponto e Vírgula
											disabled={opt.value !== ';'}
											className={opt.value !== ';' ? 'text-muted-foreground italic' : ''}
										>
											{opt.label}
											{opt.value !== ';' && ' (Em desenvolvimento)'}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<p className="mt-2 text-xs text-muted-foreground">
								Deve ser igual ao delimitador configurado nas opções de importação do Anki.
							</p>
						</div>
					</div>
				</section>

				<Separator />

				<section>
					<h2 className="text-xl font-semibold text-foreground mb-2">Atalho</h2>
					<p className="text-sm text-muted-foreground mb-6">
						Defina a combinação de teclas para ativar o aplicativo e capturar o texto.
					</p>

					<div className="flex flex-col sm:flex-row gap-4 max-w-lg items-end">
						{/* SELECT MODIFICADOR */}
						<div className="flex-1 min-w-[150px]">
							<Label htmlFor="shortcutModifier" className="text-sm font-medium leading-none mb-1 block">Modificador</Label>
							<Select
								value={shortcutModifier}
								onValueChange={setShortcutModifier}
							>
								<SelectTrigger id="shortcutModifier" className="w-full bg-input">
									<SelectValue placeholder="Selecione o Modificador" />
								</SelectTrigger>
								<SelectContent>
									{MODIFIER_OPTIONS.map((opt) => (
										<SelectItem key={opt.value} value={opt.value}>
											{opt.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						{/* INPUT TECLA */}
						<div className="w-20">
							<Label htmlFor="shortcutKey" className="text-sm font-medium leading-none mb-1 block">Tecla</Label>
							<Input
								id="shortcutKey"
								value={shortcutKey}
								onChange={(e) => setShortcutKey(e.target.value.toUpperCase().slice(0, 1))}
								maxLength={1}
								className="w-full text-center bg-input"
							/>
						</div>

						{/* BOTÃO SALVAR */}
						<Button
							onClick={handleSaveShortcut}
							// Desabilita se o atalho atual for igual ao digitado
							disabled={settings.globalShortcut === `${shortcutModifier}+${shortcutKey.toUpperCase()}`}
						>
							Salvar Atalho
						</Button>

						{/* BOTÃO REDEFINIR */}
						<Button
							variant="outline"
							onClick={handleResetShortcut}
							disabled={settings.globalShortcut === 'Control+G'}
						>
							Redefinir
						</Button>
					</div>
				</section>
			</div>
		</div>
	);
};

export default SettingsScreen;