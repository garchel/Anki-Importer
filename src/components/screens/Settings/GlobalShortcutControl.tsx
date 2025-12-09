import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import SettingsSelect from './SettingsSelect';
import { MODIFIER_OPTIONS } from '@/data/settingsOptions';
import { useGlobalShortcut } from '@/hooks/useGlobalShortcut';

// Componente para gerenciar o input e botões do atalho global (SRP).
const GlobalShortcutControl: React.FC = () => {
	const {
		modifier,
		setModifier,
		key,
		isListening,
		handleSave,
		handleReset,
		handleFocus,
		handleBlur,
		handleKeyDown,
		isModified,
		isDefault,
	} = useGlobalShortcut();

	const isSaveDisabled = !isModified || isListening || key === '...';
	const isResetDisabled = isDefault || isListening;

	return (
		<section>
			<h2 className="text-xl font-semibold text-foreground mb-2">Atalho Global</h2>
			<p className="text-sm text-muted-foreground mb-6">
				Defina a combinação de teclas para ativar o aplicativo e capturar o texto copiado.
			</p>

			<div className="flex flex-col sm:flex-row gap-4 max-w-lg items-end">
				{/* SELECT MODIFICADOR */}
				<div className="flex-1 min-w-[150px]">
					<SettingsSelect
						id="shortcutModifier"
						label="Modificador"
						value={modifier}
						options={MODIFIER_OPTIONS}
						placeholder="Selecione o Modificador"
						onValueChange={setModifier}
					/>
				</div>

				{/* INPUT TECLA */}
				<div className="w-20">
					<Label htmlFor="shortcutKey" className="text-sm font-medium leading-none mb-1 block">
						Tecla
					</Label>
					<Input
						id="shortcutKey"
						value={isListening ? '...' : key}
						readOnly={true}
						onFocus={handleFocus}
						onBlur={handleBlur}
						onKeyDown={handleKeyDown}
						className={`w-full text-center bg-input ${isListening ? 'cursor-text animate-pulse border-orange-500 border-2' : ''
							}`}
						title={isListening ? 'Pressione a tecla desejada' : 'Clique para configurar'}
					/>
				</div>

				{/* BOTÃO SALVAR */}
				<Button onClick={handleSave} disabled={isSaveDisabled}>
					Salvar Atalho
				</Button>

				{/* BOTÃO REDEFINIR */}
				<Button variant="outline" onClick={handleReset} disabled={isResetDisabled}>
					Redefinir
				</Button>
			</div>
		</section>
	);
};

export default GlobalShortcutControl;