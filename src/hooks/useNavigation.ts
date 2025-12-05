import { useState, useCallback } from 'react';

export type AppScreen = 'importer' | 'settings' | 'how-to' | 'prompts' | 'about';

export const useNavigation = () => {
    // 1. Estado da tela atual
    const [currentScreen, setCurrentScreen] = useState<AppScreen>('importer');
    
    // 2. Estado da Sidebar (retrátil)
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const navigateTo = useCallback((screen: AppScreen) => {
        setCurrentScreen(screen);
        // Opcional: Fechar a sidebar em telas menores ou após a navegação
        // if (isMobile) setIsSidebarOpen(false);
    }, []);

    const toggleSidebar = useCallback(() => {
        setIsSidebarOpen(prev => !prev);
    }, []);

    return {
        currentScreen,
        navigateTo,
        isSidebarOpen,
        toggleSidebar,
    };
};