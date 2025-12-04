// src/components/ImporterForm.tsx

import React, { useState, useEffect, useCallback } from 'react';
import {
  getDeckNames,
  getModelNames,
  addNotes,
  getModelFieldNames,
  getVersion,
} from '../api/AnkiService';
import { parseNotesFromCSVText } from '../lib/parser';

// Simulação de componentes do shadcn/ui (você deve substituir pela importação real)
const Button = ({ children, onClick, disabled, variant = 'default', className = '' }: any) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`px-4 py-2 rounded font-semibold transition-colors ${
      disabled ? 'bg-gray-300 cursor-not-allowed' : variant === 'destructive' ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-blue-600 text-white hover:bg-blue-700'
    } ${className}`}
  >
    {children}
  </button>
);
const Textarea = (props: any) => (
  <textarea
    {...props}
    className="w-full p-3 border border-gray-300 rounded resize-none focus:ring-blue-500 focus:border-blue-500"
  />
);
const Select = ({ value, onValueChange, options, placeholder }: any) => (
  <select
    value={value}
    onChange={(e) => onValueChange(e.target.value)}
    className="w-full p-2 border border-gray-300 rounded bg-white appearance-none focus:ring-blue-500 focus:border-blue-500"
  >
    <option value="" disabled>{placeholder}</option>
    {options.map((option: string) => (
      <option key={option} value={option}>{option}</option>
    ))}
  </select>
);
const Label = ({ htmlFor, children }: any) => (
  <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700 mb-1">
    {children}
  </label>
);

// --- Componente Principal ---

export const ImporterForm: React.FC = () => {
  // Estado para armazenar os dados do Anki
  const [deckNames, setDeckNames] = useState<string[]>([]);
  const [modelNames, setModelNames] = useState<string[]>([]);
  const [fieldNames, setFieldNames] = useState<string[]>([]);
  
  // Estado para a seleção do usuário
  const [selectedDeck, setSelectedDeck] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [csvText, setCsvText] = useState('');

  // Estado da UI
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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
  
  // 3. Função de Submissão
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!selectedDeck || !selectedModel || !csvText.trim()) {
      setError('Por favor, preencha todos os campos e cole o texto CSV.');
      return;
    }

    // 3a. Parsing do Texto
    let notesToImport;
    try {
      notesToImport = parseNotesFromCSVText(csvText, selectedDeck, selectedModel);
      if (notesToImport.length === 0) {
        setError('Nenhuma linha de flashcard válida foi encontrada no texto colado.');
        return;
      }
    } catch (parseError: any) {
      setError(`Erro de Parsing: ${parseError.message}`);
      return;
    }

    // 3b. Envio para o AnkiConnect
    setIsSubmitting(true);
    try {
      const results = await addNotes(notesToImport);
      const successfulCount = results.filter(id => id !== null).length;
      
      setSuccessMessage(
        `✅ Sucesso! ${successfulCount} de ${notesToImport.length} flashcards importados para o deck "${selectedDeck}".`
      );
      setCsvText(''); // Limpa o texto após o sucesso

    } catch (ankiError: any) {
      setError(`Erro de Importação para o Anki: ${ankiError.message}`);
    } finally {
      setIsSubmitting(false);
    }
  }, [csvText, selectedDeck, selectedModel]);

  // Checagens de validação
  const isFormValid = selectedDeck && selectedModel && csvText.trim() && !isSubmitting;
  const isAnkiConnected = !isLoading && !error;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">🗂️ Importador de Flashcards AnkiConnect</h2>
      
      {/* Mensagens de Status */}
      {isLoading && (
        <div className="p-4 mb-4 bg-yellow-100 text-yellow-800 rounded-md">
          Conectando ao Anki... Certifique-se de que o Anki e o AnkiConnect estão abertos.
        </div>
      )}
      {error && (
        <div className="p-4 mb-4 bg-red-100 text-red-800 rounded-md font-medium">
          ❌ Erro: {error}
        </div>
      )}
      {successMessage && (
        <div className="p-4 mb-4 bg-green-100 text-green-800 rounded-md font-medium">
          {successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Seleção de Baralho (Deck) */}
        <div>
          <Label htmlFor="deck">1. Selecione o Baralho de Destino</Label>
          <Select
            value={selectedDeck}
            onValueChange={setSelectedDeck}
            options={deckNames}
            placeholder="Escolha um Baralho"
            disabled={!isAnkiConnected}
          />
        </div>

        {/* Seleção de Tipo de Nota (Model) */}
        <div>
          <Label htmlFor="model">2. Selecione o Tipo de Nota</Label>
          <Select
            value={selectedModel}
            onValueChange={setSelectedModel}
            options={modelNames}
            placeholder="Escolha um Tipo de Nota (Ex: Basic)"
            disabled={!isAnkiConnected}
          />
        </div>

        {/* Visualização de Campos */}
        {selectedModel && (
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-md text-sm">
            <p className="font-medium mb-1">Campos do Modelo Selecionado:</p>
            <p className="text-gray-600">
              {fieldNames.length > 0 ? fieldNames.join(', ') : 'Carregando campos...'}
            </p>
            <p className="mt-2 text-xs text-blue-600">
                Lembrete: Seu texto deve mapear para os campos, seguido pelas Tags.
                <br/>**Formato Esperado:** Frente;Verso;Tag1,Tag2
            </p>
          </div>
        )}

        {/* Área de Colagem do Texto */}
        <div>
          <Label htmlFor="csvText">
            3. Cole o Conteúdo (Formato: Frente;Verso;Tag1,Tag2)
          </Label>
          <Textarea
            id="csvText"
            rows={10}
            value={csvText}
            onChange={(e: any) => setCsvText(e.target.value)}
            placeholder="Cole seu texto aqui, uma linha por flashcard. Ex: Qual a principal característica?;Única;Set,Java"
            disabled={!isAnkiConnected || isSubmitting}
          />
        </div>

        {/* Botão de Submissão */}
        <Button
          type="submit"
          disabled={!isFormValid || isSubmitting}
          className="w-full"
        >
          {isSubmitting ? 'Importando...' : `Importar ${csvText.trim() ? csvText.trim().split('\n').length : 0} Flashcards`}
        </Button>

      </form>
    </div>
  );
};