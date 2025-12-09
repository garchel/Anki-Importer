// src/components/screens/Importer/PreviewTable.tsx

import React from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import type { PreviewCard } from '@/api/types';
import { Eye, ChevronLeft } from 'lucide-react';

interface PreviewTableProps {
	previewCards: PreviewCard[];
	onToggleImport: (id: number) => void;
	onImport: () => Promise<void>;
	onBack: () => void;
	onOpenModal: (card: PreviewCard) => void;
	isSubmitting: boolean;
}

// ----------- NOVA FUNÇÃO PARA FORMATAR **negrito** ----------- //
function formatBold(text: string) {
	return text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
}

export const PreviewTable: React.FC<PreviewTableProps> = ({
	previewCards,
	onToggleImport,
	onImport,
	onBack,
	onOpenModal,
	isSubmitting,
}) => {
	const selectedCount = previewCards.filter(c => c.willImport).length;

	return (
		<div className="space-y-6">

			<h3 className="text-xl font-semibold form">
				Cards a Importar: <span className="text-blue-600">{selectedCount}</span > de {previewCards.length}
			</h3>

			{/* Botões */}
			<div className="flex justify-between items-center py-4  rounded-lg">
				<Button onClick={onBack} variant="outline" disabled={isSubmitting}>
					<ChevronLeft className="mr-2 h-4 w-4" /> Voltar e Editar Texto
				</Button>
				<Button
					onClick={onImport}
					disabled={isSubmitting || selectedCount === 0}
					className="px-8 bg-green-600 hover:bg-green-700"
				>
					{isSubmitting ? 'Importando...' : `Importar ${selectedCount} Cards Selecionados`}
				</Button>
			</div>

			{/* Tabela */}
			<div className="border rounded-lg overflow-hidden shadow-sm">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className="w-[50px]">N°</TableHead>
							<TableHead className="w-[30%]">Frente</TableHead>
							<TableHead className="w-[30%]">Verso</TableHead>
							<TableHead className="w-[20%]">Tags</TableHead>
							<TableHead className="w-[15%] text-center">Ações</TableHead>
						</TableRow>
					</TableHeader>

					<TableBody>
						{previewCards.map((card) => (
							<TableRow
								key={card.id}
								className={!card.willImport ? 'bg-red-50 opacity-70' : ''}
							>
								<TableCell className="font-medium">{card.id}</TableCell>

								{/* Frente */}
								<TableCell
									className="max-w-[150px] truncate"
									title={card.front}
								>
									<span
										dangerouslySetInnerHTML={{
											__html: formatBold(card.front),
										}}
									/>
								</TableCell>

								{/* Verso */}
								<TableCell
									className="max-w-[150px] truncate"
									title={card.back}
								>
									<span
										dangerouslySetInnerHTML={{
											__html: formatBold(card.back),
										}}
									/>
								</TableCell>

								{/* Tags */}
								<TableCell
									className="max-w-[150px] truncate text-sm text-gray-500"
									title={card.tags.join(', ')}
								>
									{card.tags.join(', ')}
								</TableCell>

								{/* Ações */}
								<TableCell className="flex items-center justify-center space-x-3 h-full py-4">

									<Checkbox
										id={`card-${card.id}`}
										checked={card.willImport}
										onCheckedChange={() => onToggleImport(card.id)}
										className="h-5 w-5"
									/>

									<Button
										onClick={() => onOpenModal(card)}
										variant="outline"
										size="icon"
										className="h-8 w-8 text-blue-600 border-blue-200 hover:bg-blue-50"
									>
										<Eye className="h-4 w-4" />
									</Button>

								</TableCell>

							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>

			<p className="text-sm text-gray-500">
				Dica: Desmarque o checkbox para ignorar um flashcard durante a importação.
			</p>

		</div>
	);
};
