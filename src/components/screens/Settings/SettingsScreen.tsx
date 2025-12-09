import React from 'react';
import { useSettings } from '../../context/SettingsContext';
import type { FieldDelimiter, AllowedModel } from '../../context/SettingsContext';
import { Separator } from '@/components/ui/separator';
import { WINDOW_RESOLUTIONS, DELIMITER_OPTIONS } from '@/data/settingsOptions';

// Componentes modulares
import SettingsSelect from '@/components/screens/Settings/SettingsSelect';
import AnkiSelect from '@/components/screens/Settings/AnkiSelect';
import GlobalShortcutControl from '@/components/screens/Settings/GlobalShortcutControl';

const SettingsScreen: React.FC = () => {
	const { settings, updateSettings, ankiData } = useSettings();
	const { error, loadAnkiData } = ankiData;

	// --- HANDLERS ---

	// Handler para mudar Resolução da Janela (Preset)
	const handleResolutionChange = (value: string) => {
		const [width, height] = value.split('x').map(Number);
		if (!isNaN(width) && !isNaN(height)) {
			updateSettings({ windowWidth: width, windowHeight: height });
		}
	};

	// Handler para mudar Delimitador do Programa (Field Delimiter)
	const handleProgramDelimiterChange = (value: string) => {
		updateSettings({ fieldDelimiter: value as FieldDelimiter });
	};

	// Handler para mudar Delimitador do Anki (Anki Delimiter)
	const handleAnkiDelimiterChange = (value: string) => {
		updateSettings({ ankiDelimiter: value as FieldDelimiter });
	};

	// Handler para mudar o Deck Padrão via Select
	const handleDefaultDeckChange = (value: string) => {
		updateSettings({ defaultDeck: value });
	};

	// Handler para mudar o Modelo Padrão via Select
	const handleDefaultModelChange = (value: string) => {
		updateSettings({ defaultModel: value as AllowedModel });
	};

	// --- LÓGICA DO VALOR SELECIONADO (UI) ---
	const currentResString = `${settings.windowWidth}x${settings.windowHeight}`;
	const isPreset = WINDOW_RESOLUTIONS.some(
		res => `${res.width}x${res.height}` === currentResString
	);
	// O valor do select deve ser o preset atual (ou um fallback seguro, o primeiro preset)
	const selectValue = isPreset
		? currentResString
		: `${WINDOW_RESOLUTIONS[0].width}x${WINDOW_RESOLUTIONS[0].height}`;

	const resolutionOptions = WINDOW_RESOLUTIONS.map(({ width, height, label }) => ({
		value: `${width}x${height}`,
		label: `${label} (${width}x${height})`,
	}));

	const programDelimiterOptions = DELIMITER_OPTIONS.map(opt => ({
		value: opt.value,
		label: opt.label,
	}));

	// Delimitador do Anki: Desabilita e avisa para opções que não são Ponto e Vírgula
	const ankiDelimiterOptions = DELIMITER_OPTIONS.map(opt => ({
		value: opt.value,
		label: opt.label,
		disabled: opt.value !== ';',
		info: opt.value !== ';' ? 'Em desenvolvimento' : undefined,
	}));

	return (
		<div className="p-6 max-w-6xl scrollbar-hide mx-auto">
			<h1 className="text-3xl font-bold text-foreground mb-5">
				Configurações
			</h1>
			<Separator className="mb-6" />

			{/* Exibição de Erros do Anki */}
			{error && (
				<div className="p-4 mb-4 bg-destructive/20 text-destructive rounded-md font-medium border border-destructive/50">
					⚠️ Erro de Conexão: {error}
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
						<SettingsSelect
							id="resolution"
							label="Resolução"
							value={selectValue}
							options={resolutionOptions}
							placeholder="Selecione a Resolução"
							onValueChange={handleResolutionChange}
						/>
					</div>
				</section>

				<Separator />

				{/* --- 2. VALORES PADRÃO DE IMPORTAÇÃO --- */}
				<section>
					<h2 className="text-xl font-semibold text-foreground mb-2">Padrões de Importação</h2>
					<p className="text-sm text-muted-foreground mb-6">
						Selecione as configurações de importação padrão. Estas serão os valores iniciais na tela de importação.
					</p>

					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg">
						{/* SELECT PARA DECK PADRÃO */}
						<AnkiSelect
							id="defaultDeck"
							label="Deck Padrão"
							value={settings.defaultDeck}
							type="deck"
							onValueChange={handleDefaultDeckChange}
						/>

						{/* SELECT PARA TIPO DE NOTA PADRÃO */}
						<AnkiSelect
							id="defaultModel"
							label="Tipo de Nota Padrão"
							value={settings.defaultModel}
							type="model"
							onValueChange={handleDefaultModelChange}
						/>
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
						<SettingsSelect
							id="programDelimiter"
							label={<>Delimitador do <span className='font-bold text-blue-400'>Programa</span></>}
							value={settings.fieldDelimiter}
							options={programDelimiterOptions}
							placeholder="Selecione o Delimitador"
							onValueChange={handleProgramDelimiterChange}
							description="Este é o delimitador usado no texto que você cola."
						/>

						{/* Delimitador CONFIGURADO NO ANKI (SAÍDA) */}
						<SettingsSelect
							id="ankiDelimiter"
							label={<>Delimitador do <span className='font-bold text-blue-400'>Anki</span></>}
							value={settings.ankiDelimiter}
							options={ankiDelimiterOptions}
							placeholder="Selecione o Delimitador"
							onValueChange={handleAnkiDelimiterChange}
							description="Deve ser igual ao delimitador configurado nas opções de importação do Anki."
						/>
					</div>
				</section>

				<Separator />

				{/* --- 4. ATALHO GLOBAL (Lógica em componente externo) --- */}
				<GlobalShortcutControl />

			</div>
		</div>
	);
};

export default SettingsScreen;