import { useState, useEffect, useCallback } from 'react';
import { getDeckNames, getModelNames, getVersion } from '@/api/AnkiService';
import { AVAILABLE_MODELS } from '@/types/settings';
import type { 
		AnkiData,
    AllowedModel, 
    AppSettings 
} from '@/types/settings';

interface UseAnkiDataLoaderProps {
    currentSettings: AppSettings;
    updateSettings: (newSettings: Partial<AppSettings>) => void;
}

// Hook responsável por carregar e gerenciar os dados de conexão do Anki.
export const useAnkiDataLoader = ({ currentSettings, updateSettings }: UseAnkiDataLoaderProps): AnkiData => {
    const [deckNames, setDeckNames] = useState<string[]>([]);
    const [modelNames, setModelNames] = useState<AllowedModel[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadAnkiData = useCallback(async () => {
        setError(null);
        setIsLoading(true);
        try {
            await getVersion();
            const decks = await getDeckNames();
            const allModels = await getModelNames();

            // Filtrando modelos permitidos pelo programa
            const filteredModels = allModels.filter((modelName) =>
                AVAILABLE_MODELS.includes(modelName as AllowedModel)
            ) as AllowedModel[];

            setDeckNames(decks);
            setModelNames(filteredModels);

            // Ajusta o defaultDeck se o atual não for mais válido
            if (decks.length > 0 && !decks.includes(currentSettings.defaultDeck)) {
                updateSettings({ defaultDeck: decks[0] });
            }

            // Ajusta o defaultModel se o atual não for mais válido
            if (filteredModels.length > 0 && !filteredModels.includes(currentSettings.defaultModel)) {
                updateSettings({ defaultModel: filteredModels[0] });
            }

        } catch (err: any) {
            // Captura erros de conexão/API
            setError(err.message || 'Erro desconhecido ao conectar ao Anki. Verifique se o Anki está aberto e o plugin AnkiConnect está instalado.');
            setDeckNames([]);
            setModelNames([]);
        } finally {
            setIsLoading(false);
        }
    }, [currentSettings.defaultDeck, currentSettings.defaultModel, updateSettings]);

    // Chama a função de carregamento na montagem e sempre que a função for alterada
    useEffect(() => {
        loadAnkiData();
    }, [loadAnkiData]);

    return {
        deckNames,
        modelNames,
        isLoading,
        error,
        isConnected: !isLoading && error === null,
        loadAnkiData,
    };
};