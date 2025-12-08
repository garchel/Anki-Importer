import React from 'react';
import { Sidebar } from './Sidebar';
import { ImporterForm } from './ImporterForm';
import { useNavigation } from '@/hooks/useNavigation';
import { SuggestedPrompts } from './SuggestedPrompts';
import { WindowControls } from './WindowControls';
import SettingsScreen from './SettingsScreen'
import HowToScreen from './HowToScreen';
import AboutScreen from './AboutScreen';
import type { AppScreen } from '@/hooks/useNavigation'

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
					Anki Importer - <span className='italic text-orange-500'>by @Garchel</span>
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