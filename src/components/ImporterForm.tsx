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
import { AnkiStatusIndicator } from './AnkiStatusIndicator'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';

import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";

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
				<SelectItem
					key={option}
					value={option}
					className="hover:bg-accent hover:text-accent-foreground"
				>
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

	const [selectedDeck, setSelectedDeck] = useState('');
	const [selectedModel, setSelectedModel] = useState('');
	const [csvText, setCsvText] = useState('');

	const [previewCards, setPreviewCards] = useState<PreviewCard[] | null>(null);
	const [currentView, setCurrentView] =
		useState<'form' | 'preview'>('form');
	const [selectedCard, setSelectedCard] = useState<PreviewCard | null>(null);

	const [isLoading, setIsLoading] = useState(true);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [successMessage, setSuccessMessage] = useState<string | null>(null);
	const [capturedText, setCapturedText] = useState('');

	const isConnected = !isLoading && !error;

	const ALLOWED_MODELS = [
		'Básico',
		'Básico (digite a resposta)',
		'Básico (e cartão invertido)',
		'Omissão de Palavras',
	];

	// Carregar Decks e Models
	useEffect(() => {
		const loadAnkiData = async () => {
			setError(null);
			setSuccessMessage(null);
			try {
				await getVersion();
				const decks = await getDeckNames();
				const allModels = await getModelNames(); // Obtém TODOS os modelos

				// --- APLICAÇÃO DO FILTRO ---
				const filteredModels = allModels.filter(modelName =>
					ALLOWED_MODELS.includes(modelName)
				);
				// ---------------------------

				setDeckNames(decks);
				setModelNames(filteredModels); // Define APENAS os modelos filtrados
			} catch (err: any) {
				setError(err.message || 'Erro desconhecido ao conectar ao Anki.');
			} finally {
				setIsLoading(false);
			}
		};
		loadAnkiData();
	}, []);

	// Carregar fields quando um Model for escolhido
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
			window.electronAPI.receiveGlobalShortcutText(listener);
		}
	}, []);

	// Parsing
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
					selectedModel
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
		[csvText, selectedDeck, selectedModel]
	);

	// Importação
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

	const handleOpenModal = useCallback((card: PreviewCard) => {
		setSelectedCard(card);
	}, []);

	const handleCloseModal = useCallback(() => {
		setSelectedCard(null);
	}, []);

	const isFormValid = selectedDeck && selectedModel && csvText.trim();
	const isAnkiConnected = !isLoading && !error;

	return (
		<div className="max-w-6xl mx-auto p-6 text-card-foreground shadow-xl rounded-lg">

			<div className='flex justify-between border-b border-border pb-2 mb-6' >
				<h2 className="text-3xl font-extrabold  ">
					{currentView === 'form'
						? 'Importar Flashcards'
						: 'Prévia e Confirmação'}
				</h2>

				<AnkiStatusIndicator
					isLoading={isLoading}
					error={error}
					isConnected={isConnected}
				/>
			</div>

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

						<CustomSelect
							value={selectedDeck}
							onValueChange={setSelectedDeck}
							options={deckNames}
							placeholder="Escolha seu Baralho."
							disabled={!isAnkiConnected}
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

						<CustomSelect
							value={selectedModel}
							onValueChange={setSelectedModel}
							options={modelNames}
							placeholder="Escolha o Tipo de Nota gerada (Ex: Básico)."
							disabled={!isAnkiConnected}
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
								Lembrete: Seu texto deve mapear para os campos, seguido pelas Tags.
								<br />
								<strong>Formato Esperado:</strong> Frente;Verso;Tag1,Tag2
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
										Separe frente e verso com ";"
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
							disabled={!isAnkiConnected || isSubmitting}
							className="bg-input border-border text-foreground focus:ring-ring"
						/>
					</div>

					{/* Botão de prévia */}
					<Button
						type="submit"
						disabled={!isFormValid || isSubmitting}
						className="w-full h-12 text-lg bg-primary text-primary-foreground hover:bg-primary/90"
					>
						{isSubmitting
							? 'Analisando...'
							: `Analisar e Pré-visualizar ${csvText.trim()
								? csvText.trim().split('\n').length
								: 0
							} Cards`}
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

			{selectedCard && (
				<CardModal card={selectedCard} onClose={handleCloseModal} />
			)}
		</div>
	);
};