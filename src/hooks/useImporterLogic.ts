import { useState, useEffect, useCallback } from 'react';
import { addNotes, getModelFieldNames } from '@/api/AnkiService';
import { parseNotesFromCSVText } from '@/lib/parser';
import { useSettings } from '../components/context/SettingsContext';
import type { PreviewCard, Note } from '@/api/types';
import type { AnkiData } from '@/types/settings';

// Interface para o retorno do hook
interface ImporterLogic {
  selectedDeck: string;
  setSelectedDeck: (deck: string) => void;
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  fieldNames: string[];
  csvText: string;
  setCsvText: (text: string) => void;
  previewCards: PreviewCard[] | null;
  currentView: 'form' | 'preview';
  setCurrentView: (view: 'form' | 'preview') => void;
  selectedCard: PreviewCard | null;
  handleOpenModal: (card: PreviewCard) => void;
  handleCloseModal: () => void;
  handleParse: (e: React.FormEvent) => void;
  handleImport: () => Promise<void>;
  handleToggleImport: (id: number) => void;
  isSubmitting: boolean;
  formError: string | null;
  successMessage: string | null;
  capturedText: string;
  isConnected: boolean;
  isFormValid: boolean | string;
}

// Hook Customizado: Lógica Central de Importação
export const useImporterLogic = (ankiData: AnkiData): ImporterLogic => {
  const { settings, updateSettings } = useSettings();
  const { error: error, isConnected, isLoading } = ankiData;

  // Estados Locais
  const [fieldNames, setFieldNames] = useState<string[]>([]);
  const [selectedDeck, setSelectedDeck] = useState(settings.defaultDeck);
  const [selectedModel, setSelectedModel] = useState(settings.defaultModel);
  const [csvText, setCsvText] = useState('');
  const [previewCards, setPreviewCards] = useState<PreviewCard[] | null>(null);
  const [currentView, setCurrentView] = useState<'form' | 'preview'>('form');
  const [selectedCard, setSelectedCard] = useState<PreviewCard | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formInternalError, setFormInternalError] = useState<string | null>(null); // Erros internos do form/parsing
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [capturedText, setCapturedText] = useState('');

  // 1. Efeito: Carregar fields do modelo selecionado
  useEffect(() => {
    const currentModel = selectedModel || settings.defaultModel;

    if (currentModel && isConnected) {
      const loadFields = async () => {
        try {
          const fields = await getModelFieldNames(currentModel);
          setFieldNames(fields);
          setFormInternalError(null);
        } catch (err: any) {
          // Captura erro ao tentar carregar campos (pode ocorrer se o modelo for excluído)
          setFormInternalError(err.message || 'Erro ao carregar campos do modelo.');
        }
      };
      loadFields();
    } else {
      setFieldNames([]);
    }
  }, [selectedModel, settings.defaultModel, isConnected]);

  // 2. Efeito: Sincroniza os selects com os valores padrão do contexto (quando o contexto muda)
  useEffect(() => {
    // Apenas sincroniza se o usuário não tiver alterado o valor para outro diferente do default.
    // Garantir que os defaults são os do settings, caso tenham sido alterados na tela de Settings.
    setSelectedDeck(settings.defaultDeck);
    setSelectedModel(settings.defaultModel);
  }, [settings.defaultDeck, settings.defaultModel]);

  // 3. Efeito: Captura de texto pelo atalho global do Electron
  useEffect(() => {
    if (window.electronAPI && window.electronAPI.receiveGlobalShortcutText) {
      const listener = (text: string) => {
        setCapturedText(text);
        setCsvText(text);
        setFormInternalError(null);
        setSuccessMessage(null);
        setCurrentView('form');
      };
      window.electronAPI.receiveGlobalShortcutText(listener);
    }
  }, []);

  // 4. Parsing do CSV para pré-visualização (Callback)
  const handleParse = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      setFormInternalError(null);
      setSuccessMessage(null);
      setCapturedText(''); // Limpa a notificação de captura após o parse

      if (!selectedDeck || !selectedModel || !csvText.trim()) {
        setFormInternalError('Por favor, preencha todos os campos e cole o texto CSV.');
        return;
      }

      try {
        const parsed = parseNotesFromCSVText(
          csvText,
          selectedDeck,
          selectedModel,
          settings.fieldDelimiter,
          settings.ankiDelimiter
        );

        if (parsed.length === 0) {
          setFormInternalError('Nenhuma linha de flashcard válida foi encontrada.');
          return;
        }

        setPreviewCards(parsed);
        setCurrentView('preview');
      } catch (parseError: any) {
        setFormInternalError(`Erro de Parsing: ${parseError.message}`);
      }
    },
    [csvText, selectedDeck, selectedModel, settings.fieldDelimiter, settings.ankiDelimiter]
  );

  // 5. Importação das notas para o Anki (Callback)
  const handleImport = useCallback(async () => {
    if (!previewCards || previewCards.length === 0) return;

    const notesToImport: Note[] = previewCards
      .filter((card) => card.willImport)
      .map((card) => card.note);

    if (notesToImport.length === 0) {
      setFormInternalError('Nenhum flashcard selecionado para importação.');
      return;
    }

    setIsSubmitting(true);
    setFormInternalError(null);
    setSuccessMessage(null);

    try {
      const results = await addNotes(notesToImport);
      const successfulCount = results.filter((id) => id !== null).length;

      setSuccessMessage(
        `✅ Sucesso! ${successfulCount} de ${notesToImport.length} flashcards importados para o deck "${selectedDeck}".`
      );
      setCsvText('');
      setPreviewCards(null);
      setCurrentView('form');
    } catch (ankiImportError: any) {
      setFormInternalError(`Erro de Importação para o Anki: ${ankiImportError.message}`);
    } finally {
      setIsSubmitting(false);
    }
  }, [previewCards, selectedDeck]);

  // 6. Toggle de importação na pré-visualização (Callback)
  const handleToggleImport = useCallback(
    (id: number) => {
      if (!previewCards) return;
      setPreviewCards(
        previewCards.map((card) =>
          card.id === id
            ? { ...card, willImport: !card.willImport }
            : card
        )
      );
    },
    [previewCards]
  );

  // 7. Handlers do Modal
  const handleOpenModal = useCallback((card: PreviewCard) => {
    setSelectedCard(card);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedCard(null);
  }, []);

  const formError = formInternalError || error;
  const isFormValid = selectedDeck && selectedModel && csvText.trim() && isConnected;

  return {
    selectedDeck,
    setSelectedDeck,
    selectedModel,
    setSelectedModel,
    fieldNames,
    csvText,
    setCsvText,
    previewCards,
    currentView,
    setCurrentView,
    selectedCard,
    handleOpenModal,
    handleCloseModal,
    handleParse,
    handleImport,
    handleToggleImport,
    isSubmitting,
    formError,
    successMessage,
    capturedText,
    isConnected,
    isFormValid,
  };
};