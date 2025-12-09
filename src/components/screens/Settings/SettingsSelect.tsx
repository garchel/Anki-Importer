import React from 'react';
import { Label } from '@/components/ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';

interface Option {
	value: string;
	label: string;
	disabled?: boolean;
	info?: string;
}

interface SettingsSelectProps {
	id: string;
	label: React.ReactNode;
	value: string;
	options: Option[];
	placeholder: string;
	onValueChange: (value: string) => void;
	description?: React.ReactNode;
	className?: string;
	disabled?: boolean;
}

// Componente genérico para renderizar um seletor de configuração simples.
const SettingsSelect: React.FC<SettingsSelectProps> = ({
	id,
	label,
	value,
	options,
	placeholder,
	onValueChange,
	description,
	className = 'w-full bg-input',
	disabled = false,
}) => (
	<div>
		<Label htmlFor={id} className="text-sm font-medium leading-none mb-1 block">
			{label}
		</Label>
		<Select
			value={value}
			onValueChange={onValueChange}
			disabled={disabled}
		>
			<SelectTrigger id={id} className={className}>
				<SelectValue placeholder={placeholder} />
			</SelectTrigger>
			<SelectContent>
				{options.map((opt) => (
					<SelectItem
						key={opt.value}
						value={opt.value}
						disabled={opt.disabled}
						className={opt.disabled ? 'text-muted-foreground italic' : ''}
					>
						{opt.label}
						{opt.info && ` (${opt.info})`}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
		{description && (
			<p className="mt-2 text-xs text-muted-foreground">{description}</p>
		)}
	</div>
);

export default SettingsSelect;