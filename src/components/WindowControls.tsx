// components/WindowControls.tsx
import React from 'react';
import { Minus, Square, X } from 'lucide-react'; 
import type { CSSProperties } from 'react';

const controls = [
	{ name: 'minimize', icon: Minus, action: () => window.electronAPI?.minimizeWindow() },
	{ name: 'maximize', icon: Square, action: () => window.electronAPI?.maximizeWindow() },
	{ name: 'close', icon: X, action: () => window.electronAPI?.closeWindow() },
];

export const WindowControls: React.FC = () => {
	// É crucial que esta div tenha a propriedade -webkit-app-region: drag;
	// para que o usuário possa arrastar a janela por esta área.
	// E os botões devem ter -webkit-app-region: no-drag; para serem clicáveis.

	// O botão 'close' usará o comando 'quit-app' (closeWindow) para fechar totalmente, conforme solicitado.

	return (
		<div
			className="flex items-center justify-end h-8 pr-1"
			style={{ WebkitAppRegion: 'drag' }} // Permite arrastar a janela por esta div
		>
			{controls.map((control) => {
				const Icon = control.icon;

				// Define classes específicas para o botão fechar
				const isClose = control.name === 'close';
				const baseClasses = "w-10 h-full p-2 flex items-center justify-center transition-colors duration-100";

				return (
					<button
						key={control.name}
						onClick={control.action}
						aria-label={control.name}
						className={`${baseClasses} ${isClose ? 'hover:bg-red-500 hover:text-white' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}
						style={{ WebkitAppRegion: 'no-drag' } as CSSProperties}
					>
						<Icon className="w-3 h-3" />
					</button>
				);
			})}
		</div>
	);
};