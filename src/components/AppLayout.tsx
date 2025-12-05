import React from 'react';
import { Sidebar } from './Sidebar';
import { ImporterForm } from './ImporterForm';
import SettingsScreen from './SettingsScreen'
import { useNavigation } from '@/hooks/useNavigation';
import { SuggestedPrompts } from './SuggestedPrompts';
import type { AppScreen } from '@/hooks/useNavigation'
import { WindowControls } from './WindowControls';

// Componentes de Conteúdo (Simulações de Telas Futuras)

const HowToScreen: React.FC = () => (
	<div className="p-6">
		<h1 className="text-3xl font-bold text-foreground">❓ Como Usar</h1>
		<p className="mt-4 text-muted-foreground">Instruções detalhadas sobre o formato CSV e atalhos.</p>
	</div>
);

const AboutScreen: React.FC = () => (
	<div className="p-6">
		<h1 className="text-3xl font-bold text-foreground">👨‍💻 Conheça o Dev</h1>
		<p className="mt-4 text-muted-foreground">Informações sobre o criador e links de contato.</p>
	</div>
);


const renderScreen = (screen: AppScreen) => {
	switch (screen) {
		case 'importer':
			return <ImporterForm />;
		case 'settings':
			return <SettingsScreen />;
		case 'how-to':
			return <HowToScreen />;
		case 'prompts':
			return <SuggestedPrompts />
		case 'about':
			return <AboutScreen />;
		default:
			return <ImporterForm />;
	}
};

export const AppLayout: React.FC = () => {
	const { currentScreen, navigateTo, isSidebarOpen, toggleSidebar } = useNavigation();

	return (
		<div className="flex h-screen overflow-hidden relative">


			<div
				className="fixed top-0 left-0 right-0 h-8 bg-background z-10"
				style={{ WebkitAppRegion: 'drag' }}
			>
				<div className="absolute top-0 right-0 h-8" style={{ WebkitAppRegion: 'no-drag' }}>
					<WindowControls />
				</div>
				<div className='absolute left-1/2 transform -translate-x-1/2 text-sm text-muted-foreground pt-1' style={{ WebkitAppRegion: 'no-drag' }}>
					Anki Importer
				</div>
			</div>


			<Sidebar
				currentScreen={currentScreen}
				navigateTo={navigateTo}
				isSidebarOpen={isSidebarOpen}
				toggleSidebar={toggleSidebar}
			/>


			<main className={`flex-1 overflow-y-auto pt-12 p-4 transition-all duration-300 ease-in-out hide-scrollbar`}>
				<div className="max-w-7xl mx-auto">
					{renderScreen(currentScreen)}
				</div>
			</main>
		</div>
	);
};