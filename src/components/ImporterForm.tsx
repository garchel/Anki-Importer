import React, { useState, useEffect, useCallback } from 'react';
import {
	addNotes,
	getModelFieldNames,
} from '../api/AnkiService'; // Removidos getDeckNames, getModelNames, getVersion
import { parseNotesFromCSVText } from '../lib/parser';
import type { PreviewCard, Note } from '../api/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { PreviewTable } from '@/components/PreviewTable';
import { CardModal } from '@/components/CardModal';
import { AnkiStatusIndicator } from './AnkiStatusIndicator'
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { SelectPadronizado } from './ui/SelectPadronizado';
import { useSettings } from './context/SettingsContext';

export const ImporterForm: React.FC = () => {
	// --- HOOK DO CONTEXTO ---
	const { settings, ankiData } = useSettings();
	const { deckNames, modelNames, isLoading, error: ankiError, isConnected, loadAnkiData } = ankiData;
	// ------------------------

	// Estado para armazenar os campos do modelo (ainda dependente do modelo selecionado)
	const [fieldNames, setFieldNames] = useState<string[]>([]);

	// Agora usando os padrões do SettingsContext como valor inicial
	const [selectedDeck, setSelectedDeck] = useState(settings.defaultDeck);
	const [selectedModel, setSelectedModel] = useState(settings.defaultModel);

	const [csvText, setCsvText] = useState('');

	const [previewCards, setPreviewCards] = useState<PreviewCard[] | null>(null);
	const [currentView, setCurrentView] =
		useState<'form' | 'preview'>('form');
	const [selectedCard, setSelectedCard] = useState<PreviewCard | null>(null);

	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null); // Erros internos do form/parsing
	const [successMessage, setSuccessMessage] = useState<string | null>(null);
	const [capturedText, setCapturedText] = useState('');


	// Carregar fields quando um Model for escolhido
	useEffect(() => {
		// Usar o modelo padrão do Contexto se nada estiver selecionado
		const currentModel = selectedModel || settings.defaultModel;

		if (currentModel) {
			const loadFields = async () => {
				try {
					const fields = await getModelFieldNames(currentModel);
					setFieldNames(fields);
				} catch (err: any) {
					setError(err.message || 'Erro ao carregar campos do modelo.');
				}
			};
			loadFields();
		} else {
			setFieldNames([]);
		}
	}, [selectedModel, settings.defaultModel]);


	// Sincroniza os selects com os valores padrão do contexto
	useEffect(() => {
		setSelectedDeck(settings.defaultDeck);
		setSelectedModel(settings.defaultModel);
	}, [settings.defaultDeck, settings.defaultModel]);


	// Captura de texto pelo atalho global
	useEffect(() => {
		if (window.electronAPI) {
			const listener = (text: string) => {
				setCapturedText(text);
				setCsvText(text);
				setError(null);
				setSuccessMessage(null);
				setCurrentView('form');
			};
			// Registrando listener para o atalho global de captura de texto
			window.electronAPI.receiveGlobalShortcutText(listener);
		}
	}, []);

	// Parsing do CSV para pré-visualização
	const handleParse = useCallback(
		(e: React.FormEvent) => {
			e.preventDefault();
			setError(null);
			setSuccessMessage(null);

			if (!selectedDeck || !selectedModel || !csvText.trim()) {
				setError('Por favor, preencha todos os campos e cole o texto CSV.');
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
					setError('Nenhuma linha de flashcard válida foi encontrada.');
					return;
				}

				setPreviewCards(parsed);
				setCurrentView('preview');
			} catch (parseError: any) {
				setError(`Erro de Parsing: ${parseError.message}`);
			}
		},
		[csvText, selectedDeck, selectedModel, settings.fieldDelimiter, settings.ankiDelimiter]
	);

	// Importação das notas para o Anki
	const handleImport = useCallback(async () => {
		if (!previewCards || previewCards.length === 0) return;

		const notesToImport: Note[] = previewCards
			.filter((card) => card.willImport)
			.map((card) => card.note);

		if (notesToImport.length === 0) {
			setError('Nenhum flashcard selecionado para importação.');
			return;
		}

		setIsSubmitting(true);
		setError(null);

		try {
			const results = await addNotes(notesToImport);
			const successfulCount = results.filter((id) => id !== null).length;

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

	// Alterna o status de importação de um card na pré-visualização
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

	// Abre o modal de visualização de card
	const handleOpenModal = useCallback((card: PreviewCard) => {
		setSelectedCard(card);
	}, []);

	// Fecha o modal de visualização de card
	const handleCloseModal = useCallback(() => {
		setSelectedCard(null);
	}, []);

	const formError = error || ankiError;
	const isFormValid = selectedDeck && selectedModel && csvText.trim();

	return (
		<div className="max-w-6xl mx-auto p-6 text-card-foreground shadow-xl rounded-lg">

			<div className='flex justify-between border-b border-border pb-2 mb-6' >
				<h2 className="text-3xl font-extrabold  ">
					{currentView === 'form'
						? 'Importar Flashcards'
						: 'Prévia e Confirmação'}
				</h2>

				{/* Indicador de status de conexão com Anki */}
				<AnkiStatusIndicator
					isLoading={isLoading}
					error={ankiError}
					isConnected={isConnected}
				/>
			</div>

			{/* Exibição de Erros */}
			{formError && (
				<div className="p-4 mb-4 bg-destructive/20 text-destructive rounded-md font-medium border border-destructive/50">
					❌ Erro: {formError}.
					{!isConnected && ankiError && (
						<button onClick={loadAnkiData} className="ml-2 underline hover:no-underline font-bold">Tentar Recarregar?</button>
					)}
				</div>
			)}

			{/* Exibição de Mensagens de Sucesso */}
			{successMessage && (
				<div className="p-4 mb-4 bg-secondary text-secondary-foreground rounded-md font-medium border border-border">
					{successMessage}
				</div>
			)}

			{/* Notificação de texto capturado */}
			{capturedText && currentView === 'form' && (
				<div className="p-3 mb-4 bg-primary/20 text-secondary-foreground rounded-md font-medium text-sm border border-primary/50">
					✨ Texto capturado via atalho global: <strong>{capturedText.substring(0, 100)}...</strong>
				</div>
			)}

			{currentView === 'form' && (
				<form onSubmit={handleParse} className="space-y-6">
					{/* 1. SELEÇÃO DO BARALHO */}
					<div>
						<div className="flex items-center mb-2">
							<Label htmlFor="deck">1. Selecione seu Baralho de Destino</Label>

							<TooltipProvider>
								<Tooltip>
									<TooltipTrigger asChild>
										<button type="button" className="ml-2 text-xs text-muted-foreground hover:text-foreground">(?)</button>
									</TooltipTrigger>
									<TooltipContent side="right" className="max-w-xs">
										Escolha o baralho onde os flashcards serão importados.
										Exemplo: "Inglês", "Medicina", "Geografia".
									</TooltipContent>
								</Tooltip>
							</TooltipProvider>
						</div>

						<SelectPadronizado
							value={selectedDeck}
							onValueChange={setSelectedDeck}
							options={deckNames}
							placeholder="Escolha seu Baralho."
							disabled={!isConnected || isLoading}
						/>
					</div>

					{/* 2. SELEÇÃO DO MODELO */}
					<div>
						<div className="flex items-center mb-2">
							<Label htmlFor="model">2. Selecione o Tipo de Nota</Label>

							<TooltipProvider>
								<Tooltip>
									<TooltipTrigger asChild>
										<button type="button" className="ml-2 text-xs text-muted-foreground hover:text-foreground">(?)</button>
									</TooltipTrigger>
									<TooltipContent side="right" className="max-w-xs">
										O tipo de nota define a estrutura do flashcard (campos e cartões).
										Garanta que o tipo de card selecionado é o mesmo tipo de card do texto.
									</TooltipContent>
								</Tooltip>
							</TooltipProvider>
						</div>

						{/* Uso do SelectPadronizado para Tipo de Nota */}
						<SelectPadronizado
							value={selectedModel}
							onValueChange={setSelectedModel}
							options={modelNames}
							placeholder="Escolha o Tipo de Nota gerada (Ex: Básico)."
							disabled={!isConnected || isLoading}
						/>
					</div>

					{/* Campos do modelo */}
					{selectedModel && (
						<div className="p-3 bg-secondary border border-border rounded-md text-sm text-secondary-foreground">
							<p className="font-medium mb-1">Campos do Modelo Selecionado:</p>
							<p className="text-muted-foreground">
								{fieldNames.length > 0 ? fieldNames.join(', ') : 'Carregando campos...'}
							</p>
							<p className="mt-2 text-primary text-xs">
								Lembrete: Seu texto deve mapear para os campos, seguido pelas Tags. O delimitador de campo usado é
								<strong>"{settings.fieldDelimiter}"</strong>.
								<br />
								<strong>Formato Esperado:</strong> Frente{settings.fieldDelimiter}Verso{settings.fieldDelimiter}Tag1,Tag2
							</p>
						</div>
					)}

					{/* 3. COLAGEM DO TEXTO */}
					<div>
						<div className="flex items-center mb-2">
							<Label htmlFor="csvText">3. Cole o Conteúdo</Label>

							<TooltipProvider>
								<Tooltip>
									<TooltipTrigger asChild>
										<button type="button" className="ml-2 text-xs text-muted-foreground hover:text-foreground">(?)</button>
									</TooltipTrigger>
									<TooltipContent side="right" className="max-w-xs">
										Cole uma lista de flashcards, um por linha.
										Separe frente e verso com "{settings.fieldDelimiter}"
									</TooltipContent>
								</Tooltip>
							</TooltipProvider>
						</div>

						<Textarea
							id="csvText"
							rows={10}
							value={csvText}
							onChange={(e: any) => setCsvText(e.target.value)}
							placeholder="Cole seu texto aqui."
							disabled={!isConnected || isSubmitting}
							className="bg-input border-border text-foreground focus:ring-ring"
						/>
					</div>

					{/* Botão de prévia */}
					<Button
						type="submit"
						disabled={!isFormValid || isSubmitting || !isConnected}
						className="w-full h-12 text-lg bg-primary text-primary-foreground hover:bg-primary/90"
					>
						{/* Exibe a contagem de cards a serem analisados */}
						{isSubmitting
							? 'Analisando...'
							: `Analisar e Pré-visualizar ${csvText.trim()
								? csvText.trim().split('\n').length
								: 0
							} Cards`}
					</Button>
				</form>
			)}

			{/* Visualização da Prévia */}
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

			{/* Modal de visualização de card */}
			{selectedCard && (
				<CardModal card={selectedCard} onClose={handleCloseModal} />
			)}
		</div>
	);
};