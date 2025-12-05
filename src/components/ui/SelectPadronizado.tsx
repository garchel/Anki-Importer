// src/components/SelectPadronizado.tsx

import React from 'react';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';

interface SelectPadronizadoProps {
	value: string;
	onValueChange: (value: string) => void;
	options: string[];
	placeholder: string;
	disabled: boolean;
}

/**
 * Um wrapper para o Select do shadcn/ui com estilos padronizados.
 *
 * @param {string} value - O valor atualmente selecionado.
 * @param {function} onValueChange - Callback ao mudar o valor.
 * @param {string[]} options - Array de strings para as opções.
 * @param {string} placeholder - Texto placeholder.
 * @param {boolean} disabled - Indica se o select está desabilitado.
 */
export const SelectPadronizado: React.FC<SelectPadronizadoProps> = ({
	value,
	onValueChange,
	options,
	placeholder,
	disabled,
}) => (
	<Select value={value} onValueChange={onValueChange} disabled={disabled}>
		{/* Aplica classes de estilo e acessibilidade para o botão do select */}
		<SelectTrigger className="w-full bg-input border-border text-foreground focus:ring-ring disabled:opacity-50">
			<SelectValue placeholder={placeholder} />
		</SelectTrigger>

		{/* Aplica classes de estilo para o contêiner das opções */}
		<SelectContent className="bg-popover text-popover-foreground border-border">
			{options.map((option) => (
				<SelectItem
					key={option}
					value={option}
					// Aplica classes de estilo para o hover das opções
					className="hover:bg-accent hover:text-accent-foreground"
				>
					{option}
				</SelectItem>
			))}
		</SelectContent>
	</Select>
);