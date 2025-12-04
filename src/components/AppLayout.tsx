import React from 'react';
import { Sidebar } from './Sidebar';
import { ImporterForm } from './ImporterForm';
import { useNavigation } from '@/hooks/useNavigation';
import type { AppScreen } from '@/hooks/useNavigation'

// Componentes de Conteúdo (Simulações de Telas Futuras)
const SettingsScreen: React.FC = () => (
    <div className="p-6">
        <h1 className="text-3xl font-bold text-foreground">⚙️ Configurações</h1>
        <p className="mt-4 text-muted-foreground">Aqui você ajustará as preferências do aplicativo.</p>
    </div>
);

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
    // Renderização Otimizada: Apenas a tela ativa é renderizada
    switch (screen) {
        case 'importer':
            // Passamos o layoutClasses (max-w-7xl, mx-auto) para o ImporterForm 
            // para manter o seu responsivo interno.
            return <ImporterForm />;
        case 'settings':
            return <SettingsScreen />;
        case 'how-to':
            return <HowToScreen />;
        case 'about':
            return <AboutScreen />;
        default:
            return <ImporterForm />;
    }
};


export const AppLayout: React.FC = () => {
    const { currentScreen, navigateTo, isSidebarOpen, toggleSidebar } = useNavigation();

    // 1. A div externa usa `flex h-screen` para preencher toda a tela
    return (
        <div className="flex h-screen overflow-hidden">
            {/* 2. Sidebar */}
            <Sidebar
                currentScreen={currentScreen}
                navigateTo={navigateTo}
                isSidebarOpen={isSidebarOpen}
                toggleSidebar={toggleSidebar}
            />

            {/* 3. Área Principal de Conteúdo */}
            <main className={`flex-1 overflow-y-auto p-4 transition-all duration-300 ease-in-out`}>
                <div className="max-w-7xl mx-auto">
                    {/* Renderiza o conteúdo da tela ativa */}
                    {renderScreen(currentScreen)}
                </div>
            </main>
        </div>
    );
};