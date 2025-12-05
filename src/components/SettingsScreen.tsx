import React, { useEffect, useState } from 'react';

// --- MOCK E TIPAGEM PARA TORNAR O COMPONENTE EXECUTÁVEL (Self-Contained) ---
declare global {
	interface Window {
		electronAPI?: {
			updateWindowSize: (size: { width: number; height: number }) => void;
		};
	}
}

type FieldDelimiter = ';' | '|' | '\t';
type AllowedModel = 'Basic' | 'Basic (and reversed card)' | 'Cloze' | 'Custom Model';

interface Settings {
	allowedModels: AllowedModel[];
	fieldDelimiter: FieldDelimiter;
	defaultDeck: string;
	defaultModel: AllowedModel;
	windowWidth: number;
	windowHeight: number;
}

interface SettingsContextType {
	settings: Settings;
	updateSettings: (newSettings: Partial<Settings>) => void;
}

const AVAILABLE_MODELS: AllowedModel[] = [
	'Basic',
	'Basic (and reversed card)',
	'Cloze',
	'Custom Model'
];

// Hook mockado para simular o contexto
const useSettings = (): SettingsContextType => {
	// Inicializa com um tamanho padrão
	const [settings, setSettings] = React.useState<Settings>({
		allowedModels: ['Basic', 'Cloze'],
		fieldDelimiter: '|',
		defaultDeck: 'Default Deck',
		defaultModel: 'Basic',
		windowWidth: 1024,
		windowHeight: 768,
	});

	const updateSettings = (newSettings: Partial<Settings>) => {
		setSettings(prev => ({ ...prev, ...newSettings }));
	};

	return { settings, updateSettings };
};
// ---------------------------------------------------------------------------

import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import type { CheckedState } from '@radix-ui/react-checkbox';

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';

const WINDOW_RESOLUTIONS = [
	{ width: 800, height: 600, label: 'Pequena' },
	{ width: 1024, height: 768, label: 'Média' },
	{ width: 1280, height: 800, label: 'Grande' },
	{ width: 1440, height: 900, label: 'Extra Grande' },
];

const SettingsScreen: React.FC = () => {
	const { settings, updateSettings } = useSettings();

	// --- NOVO: Efeito para detectar redimensionamento manual ---
	useEffect(() => {
		const handleResize = () => {
			// Atualiza as configurações com o tamanho real atual da janela
			updateSettings({
				windowWidth: window.innerWidth,
				windowHeight: window.innerHeight
			});
		};

		// Adiciona um debounce simples para não atualizar excessivamente durante o arrasto
		let timeoutId: NodeJS.Timeout;
		const debouncedResize = () => {
			clearTimeout(timeoutId);
			timeoutId = setTimeout(handleResize, 150); // Aguarda 150ms após o movimento parar
		};

		window.addEventListener('resize', debouncedResize);

		// Cleanup
		return () => {
			window.removeEventListener('resize', debouncedResize);
			clearTimeout(timeoutId);
		};
	}, [updateSettings]); // Dependência do updateSettings

	const handleModelToggle = (model: AllowedModel, checked: CheckedState) => {
		if (checked === 'indeterminate') return;

		const newAllowedModels = checked
			? [...settings.allowedModels, model]
			: settings.allowedModels.filter(m => m !== model);

		updateSettings({ allowedModels: newAllowedModels });
	};

	const handleDelimiterChange = (value: string) => {
		if ([';', '|', '\t'].includes(value)) {
			updateSettings({ fieldDelimiter: value as FieldDelimiter });
		}
	};

	const handleResolutionChange = (value: string) => {
		// Se o usuário selecionar "custom", não fazemos nada (já está no tamanho atual)
		if (value === 'custom') return;

		const [width, height] = value.split('x').map(Number);
		if (!isNaN(width) && !isNaN(height)) {
			if (typeof window.electronAPI !== 'undefined') {
				window.electronAPI.updateWindowSize({ width, height });
			}
			updateSettings({ windowWidth: width, windowHeight: height });
		}
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		updateSettings({ defaultDeck: e.target.value });
	};

	// --- LÓGICA DO "PERSONALIZADO" ---

	// 1. Gera a string atual "WxH"
	const currentResString = `${settings.windowWidth}x${settings.windowHeight}`;

	// 2. Verifica se a resolução atual bate com alguma da lista predefinida
	const isPreset = WINDOW_RESOLUTIONS.some(
		res => `${res.width}x${res.height}` === currentResString
	);

	// 3. Define o valor do Select: se for preset, usa o valor "WxH", senão usa "custom"
	const selectValue = isPreset ? currentResString : 'custom';

	return (
		<div className="p-6 max-w-2xl">
			<h1 className="text-3xl font-bold text-foreground mb-6 flex items-center">
				⚙️ Configurações
			</h1>

			<p className="mt-4 text-muted-foreground mb-8">
				Ajuste as preferências do aplicativo e os valores padrão de importação.
			</p>

			<div className="space-y-10">

				{/* --- 1. CONFIGURAÇÕES DA JANELA --- */}
				<section>
					<h2 className="text-xl font-semibold text-foreground mb-4">Aparência da Janela</h2>
					<p className="text-sm text-muted-foreground mb-3">
						Selecione o tamanho padrão ou redimensione a janela manualmente.
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
								{/* Opções Predefinidas */}
								{WINDOW_RESOLUTIONS.map(({ width, height, label }) => (
									<SelectItem key={`${width}x${height}`} value={`${width}x${height}`}>
										{label} ({width}x{height})
									</SelectItem>
								))}

								{/* Opção Personalizada: Só aparece (ou é selecionável) se estiver ativa */}
								{!isPreset && (
									<SelectItem value="custom">
										Personalizado ({settings.windowWidth}x{settings.windowHeight})
									</SelectItem>
								)}
							</SelectContent>
						</Select>
						<p className="mt-2 text-xs text-secondary-foreground">
							{isPreset
								? "A alteração será aplicada na próxima vez que a janela for restaurada."
								: "Resolução personalizada detectada."}
						</p>
					</div>
				</section>

				<Separator />

				{/* --- 2. VALORES PADRÃO DE IMPORTAÇÃO --- */}
				<section>
					<h2 className="text-xl font-semibold text-foreground mb-4">Padrões de Importação</h2>
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg">
						<div>
							<Label htmlFor="defaultDeck" className="text-sm font-medium leading-none mb-1 block">Deck Padrão</Label>
							<Input
								id="defaultDeck"
								value={settings.defaultDeck}
								onChange={handleInputChange}
								placeholder="Ex: Meu Novo Deck"
								className="bg-input"
							/>
						</div>
						<div>
							<Label htmlFor="defaultModel" className="text-sm font-medium leading-none mb-1 block">Tipo de Nota Padrão</Label>
							<Select
								value={settings.defaultModel}
								onValueChange={(value: string) => updateSettings({ defaultModel: value as AllowedModel })}
							>
								<SelectTrigger id="defaultModel" className="w-full bg-input">
									<SelectValue placeholder="Selecione o Tipo de Nota" />
								</SelectTrigger>
								<SelectContent>
									{AVAILABLE_MODELS.map((model) => (
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

				{/* --- 3. DELIMITADOR --- */}
				<section>
					<h2 className="text-xl font-semibold text-foreground mb-4">Delimitador de Campo (CSV)</h2>
					<div className="max-w-xs">
						<Select
							value={settings.fieldDelimiter}
							onValueChange={handleDelimiterChange}
						>
							<SelectTrigger id="delimiter" className="w-full bg-input">
								<SelectValue placeholder="Selecione o Delimitador" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value=";">Ponto e Vírgula (;)</SelectItem>
								<SelectItem value="|">Pipe (|)</SelectItem>
								<SelectItem value="\t">Tabulação (TAB)</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</section>

				<Separator />

				{/* --- 4. FILTRO DE MODELOS --- */}
				<section>
					<h2 className="text-xl font-semibold text-foreground mb-4">Tipos de Nota Permitidos</h2>
					<div className="grid gap-3">
						{AVAILABLE_MODELS.map((model) => (
							<div key={model} className="flex items-center space-x-3">
								<Checkbox
									id={`model-${model}`}
									checked={settings.allowedModels.includes(model)}
									onCheckedChange={(checked: CheckedState) => handleModelToggle(model, checked)}
								/>
								<Label htmlFor={`model-${model}`} className="text-base font-normal cursor-pointer">
									{model}
								</Label>
							</div>
						))}
					</div>
				</section>
			</div>
		</div>
	);
};

export default SettingsScreen;