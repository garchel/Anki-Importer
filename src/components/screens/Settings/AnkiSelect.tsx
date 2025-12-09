import React from 'react';
import { useSettings } from '../../context/SettingsContext';
//import type { AllowedModel } from '../../context/SettingsContext';
import SettingsSelect from './SettingsSelect';

interface AnkiSelectProps {
	id: string;
	label: string;
	value: string;
	type: 'deck' | 'model';
	onValueChange: (value: string) => void;
}

// Componente especializado para Decks e Modelos do Anki (SRP).
const AnkiSelect: React.FC<AnkiSelectProps> = ({ id, label, value, type, onValueChange }) => {
	const { ankiData } = useSettings();
	const { deckNames, modelNames, isLoading, error } = ankiData;

	const options = type === 'deck' ? deckNames : modelNames;
	const loadingPlaceholder = type === 'deck' ? 'Carregando decks...' : 'Carregando modelos...';

	// Se houver erro, renderiza uma opção de erro desabilitada
	if (error) {
		return (
			<SettingsSelect
				id={id}
				label={label}
				value="error"
				options={[{ value: 'error', label: error, disabled: true }]}
				placeholder={error}
				onValueChange={() => { }}
				disabled={true}
			/>
		);
	}

	// Se estiver carregando, exibe a mensagem de carregamento
	if (isLoading) {
		return (
			<SettingsSelect
				id={id}
				label={label}
				value=""
				options={[]}
				placeholder={loadingPlaceholder}
				onValueChange={() => { }}
				disabled={true}
			/>
		);
	}

	const selectOptions = options.map((name) => ({
		value: name,
		label: name,
	}));

	return (
		<SettingsSelect
			id={id}
			label={label}
			value={value}
			options={selectOptions}
			placeholder={`Selecione o ${label}`}
			onValueChange={onValueChange}
		/>
	);
};

export default AnkiSelect;