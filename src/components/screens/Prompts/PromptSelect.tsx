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
}

interface PromptSelectProps {
	id: string;
	label: string;
	value: string;
	options: Option[];
	onValueChange: (value: string) => void;
}

// Componente genérico para renderizar os seletores de configuração (DRY).
const PromptSelect: React.FC<PromptSelectProps> = ({
	id,
	label,
	value,
	options,
	onValueChange,
}) => (
	<div className="flex flex-col space-y-2">
		<Label htmlFor={id} className="font-semibold">
			{label}
		</Label>
		<Select value={value} onValueChange={onValueChange}>
			<SelectTrigger id={id} className="w-full bg-input">
				<SelectValue placeholder={`Selecione ${label}`} />
			</SelectTrigger>
			<SelectContent>
				{options.map((opt) => (
					<SelectItem key={opt.value} value={opt.value}>
						{opt.label}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	</div>
);

export default PromptSelect;