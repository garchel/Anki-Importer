import React, { useState, useEffect, useCallback } from 'react';
import {
  getDeckNames,
  getModelNames,
  addNotes,
  getModelFieldNames,
  getVersion,
} from '../api/AnkiService';
import { parseNotesFromCSVText } from '../lib/parser';
import type { PreviewCard, Note } from '../api/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { PreviewTable } from '@/components/PreviewTable';
import { CardModal } from '@/components/CardModal';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

// --- Interface para a API do Electron ---
declare global {
  interface Window {
    electronAPI?: {
      onReceiveText: (callback: (text: string) => void) => void;
    };
  }
}

// -----------------------------------------------------------
// Componente CustomSelect Reimplementado usando shadcn/ui Select
// -----------------------------------------------------------
interface CustomSelectProps {
    value: string;
    onValueChange: (value: string) => void;
    options: string[];
    placeholder: string;
    disabled: boolean;
}

const CustomSelect: React.FC<CustomSelectProps> = ({ value, onValueChange, options, placeholder, disabled }) => (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger className="w-full bg-input border-border text-foreground focus:ring-ring disabled:opacity-50">
            <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="bg-popover text-popover-foreground border-border">
            {options.map((option) => (
                <SelectItem key={option} value={option} className="hover:bg-accent hover:text-accent-foreground">
                    {option}
                </SelectItem>
            ))}
        </SelectContent>
    </Select>
);
// -----------------------------------------------------------

export const ImporterForm: React.FC = () => {
    // Estado para armazenar os dados do Anki
    const [deckNames, setDeckNames] = useState<string[]>([]);
    const [modelNames, setModelNames] = useState<string[]>([]);
    const [fieldNames, setFieldNames] = useState<string[]>([]);
    
    // Estado para a seleção do usuário
    const [selectedDeck, setSelectedDeck] = useState('');
    const [selectedModel, setSelectedModel] = useState('');
    const [csvText, setCsvText] = useState('');

    // --- NOVOS ESTADOS PARA PRÉVIA ---
    const [previewCards, setPreviewCards] = useState<PreviewCard[] | null>(null);
    const [currentView, setCurrentView] = useState<'form' | 'preview'>('form');
    const [selectedCard, setSelectedCard] = useState<PreviewCard | null>(null); // Para o modal de visualização

    // Estado da UI
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [capturedText, setCapturedText] = useState('');
    
    // 1. Carregar Decks e Models ao montar o componente
    useEffect(() => {
        const loadAnkiData = async () => {
          setError(null);
          setSuccessMessage(null);
          try {
            await getVersion(); // Testa a conexão primeiro
            const decks = await getDeckNames();
            const models = await getModelNames();
            setDeckNames(decks);
            setModelNames(models);
          } catch (err: any) {
            setError(err.message || 'Erro desconhecido ao conectar ao Anki.');
          } finally {
            setIsLoading(false);
          }
        };
        loadAnkiData();
    }, []);

    // 2. Carregar FieldNames sempre que um Model for selecionado
    useEffect(() => {
        if (selectedModel) {
          const loadFields = async () => {
            try {
              const fields = await getModelFieldNames(selectedModel);
              setFieldNames(fields);
            } catch (err: any) {
              setError(err.message || 'Erro ao carregar campos do modelo.');
            }
          };
          loadFields();
        } else {
          setFieldNames([]);
        }
    }, [selectedModel]);
      
    // 3. Efeito para ouvir o atalho global (captura de texto)
    useEffect(() => {
        if (window.electronAPI) {
          console.log("Ouvindo o atalho global...");
          
          const listener = (text: string) => {
            setCapturedText(text);
            setCsvText(text); 
            setError(null);
            setSuccessMessage(null);
            setCurrentView('form'); 
          };
          
          window.electronAPI.onReceiveText(listener);
        }
    }, []);

    // 4. Lógica de Parsing
    const handleParse = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);

        if (!selectedDeck || !selectedModel || !csvText.trim()) {
            setError('Por favor, preencha todos os campos e cole o texto CSV.');
            return;
        }

        try {
            const parsed = parseNotesFromCSVText(csvText, selectedDeck, selectedModel);
            
            if (parsed.length === 0) {
                setError('Nenhuma linha de flashcard válida foi encontrada.');
                return;
            }
            
            setPreviewCards(parsed);
            setCurrentView('preview');
        } catch (parseError: any) {
            setError(`Erro de Parsing: ${parseError.message}`);
        }
    }, [csvText, selectedDeck, selectedModel]);

    // 5. Lógica de Importação
    const handleImport = useCallback(async () => {
        if (!previewCards || previewCards.length === 0) return;
        
        const notesToImport: Note[] = previewCards
            .filter(card => card.willImport)
            .map(card => card.note);

        if (notesToImport.length === 0) {
            setError('Nenhum flashcard selecionado para importação.');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const results = await addNotes(notesToImport);
            const successfulCount = results.filter(id => id !== null).length;
            
            setSuccessMessage(
                `✅ Sucesso! ${successfulCount} de ${notesToImport.length} flashcards importados para o deck "${selectedDeck}".`
            );
            setCsvText('');
            setPreviewCards(null);
            setCurrentView('form');
        } catch (ankiError: any) {
            setError(`Erro de Importação para o Anki: ${ankiError.message}`);
        } finally {
            setIsSubmitting(false);
        }
    }, [previewCards, selectedDeck]);
    
    // 6. Lógica de Checkbox (Toggle de importação na tabela)
    const handleToggleImport = useCallback((id: number) => {
        if (!previewCards) return;
        setPreviewCards(
          previewCards.map(card =>
            card.id === id ? { ...card, willImport: !card.willImport } : card
          )
        );
    }, [previewCards]);
    
    // 7. Lógica de Modal
    const handleOpenModal = useCallback((card: PreviewCard) => {
        setSelectedCard(card);
    }, []);
    
    const handleCloseModal = useCallback(() => {
        setSelectedCard(null);
    }, []);


    // Checagens de validação
    const isFormValid = selectedDeck && selectedModel && csvText.trim();
    const isAnkiConnected = !isLoading && !error;


    // --- Renderização ---
    return (
        <div className="max-w-6xl mx-auto p-6 bg-card text-card-foreground shadow-xl rounded-lg border border-border">
            <h2 className="text-3xl font-extrabold mb-6 border-b border-border pb-2">
                {currentView === 'form' ? '🗂️ Importador de Flashcards' : '👀 Prévia e Confirmação'}
            </h2>
            
            {/* Mensagens de Status: Usando cores temáticas de Alerta/Destrutivo */}
            {isLoading && (
                <div className="p-4 mb-4 bg-muted text-muted-foreground rounded-md border border-border">
                    Conectando ao Anki... Verifique se o Anki está aberto.
                </div>
            )}
            {error && (
                <div className="p-4 mb-4 bg-destructive/20 text-destructive rounded-md font-medium border border-destructive/50">
                    ❌ Erro: {error}
                </div>
            )}
            {successMessage && (
                <div className="p-4 mb-4 bg-secondary text-secondary-foreground rounded-md font-medium border border-border">
                    {successMessage}
                </div>
            )}
            {capturedText && currentView === 'form' && (
                <div className="p-3 mb-4 bg-primary/20 text-secondary-foreground rounded-md font-medium text-sm border border-primary/50">
                    ✨ Texto capturado via atalho global: **{capturedText.substring(0, 100)}...**
                </div>
            )}

            
            {/* --- Renderização Condicional --- */}
            {currentView === 'form' && (
                <form onSubmit={handleParse} className="space-y-6">
                    
                    {/* Seleção de Baralho (Deck) */}
                    <div>
                        <Label htmlFor="deck" className='mb-2'>1. Selecione o Baralho de Destino</Label>
                        <CustomSelect
                            value={selectedDeck}
                            onValueChange={setSelectedDeck}
                            options={deckNames}
                            placeholder="Escolha um Baralho"
                            disabled={!isAnkiConnected}
                        />
                    </div>

                    {/* Seleção de Tipo de Nota (Model) */}
                    <div>
                        <Label htmlFor="model" className='mb-2'>2. Selecione o Tipo de Nota</Label>
                        <CustomSelect
                            value={selectedModel}
                            onValueChange={setSelectedModel}
                            options={modelNames}
                            placeholder="Escolha um Tipo de Nota (Ex: Basic)"
                            disabled={!isAnkiConnected}
                        />
                    </div>

                    {/* Visualização de Campos */}
                    {selectedModel && (
                        <div className="p-3 bg-secondary border border-border rounded-md text-sm text-secondary-foreground">
                            <p className="font-medium mb-1">Campos do Modelo Selecionado:</p>
                            <p className="text-muted-foreground">
                                {fieldNames.length > 0 ? fieldNames.join(', ') : 'Carregando campos...'}
                            </p>
                            <p className="mt-2 text-primary text-xs">
                                Lembrete: Seu texto deve mapear para os campos, seguido pelas Tags.
                                <br/>**Formato Esperado:** Frente;Verso;Tag1,Tag2
                            </p>
                        </div>
                    )}

                    {/* Área de Colagem do Texto */}
                    <div>
                        <Label htmlFor="csvText" className='mb-2'>
                            3. Cole o Conteúdo
                        </Label>
                        {/* Textarea usa bg-input e border-input */}
                        <Textarea
                            id="csvText"
                            rows={10}
                            value={csvText}
                            onChange={(e: any) => setCsvText(e.target.value)}
                            placeholder="Cole seu texto aqui, uma linha por flashcard. Ex: Qual a principal característica?;Única;Set,Java"
                            disabled={!isAnkiConnected || isSubmitting}
                            className="bg-input border-border text-foreground focus:ring-ring"
                        />
                    </div>

                    {/* Botão de Análise: Usa o Primary para ação principal */}
                    <Button
                        type="submit"
                        disabled={!isFormValid || isSubmitting}
                        className="w-full h-12 text-lg bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                        {isSubmitting ? 'Analisando...' : `Analisar e Pré-visualizar ${csvText.trim() ? csvText.trim().split('\n').length : 0} Cards`}
                    </Button>

                </form>
            )}

            {currentView === 'preview' && previewCards && (
                <PreviewTable
                    previewCards={previewCards}
                    onToggleImport={handleToggleImport}
                    onImport={handleImport}
                    onBack={() => setCurrentView('form')}
                    onOpenModal={handleOpenModal}
                    isSubmitting={isSubmitting}
                />
            )}
            
            {/* Modal de Visualização em Tela Cheia */}
            {selectedCard && (
                <CardModal card={selectedCard} onClose={handleCloseModal} />
            )}
        </div>
    );
};