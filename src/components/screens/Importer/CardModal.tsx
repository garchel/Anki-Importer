// src/components/CardModal.tsx

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { PreviewCard } from '../api/types'; // Certifique-se de que a importação está correta

interface CardModalProps {
  card: PreviewCard;
  onClose: () => void;
}

export const CardModal: React.FC<CardModalProps> = ({ card, onClose }) => {
  return (
    // O 'open' controla a visibilidade. 'onOpenChange' fecha o modal ao clicar fora ou apertar ESC.
    <Dialog open={!!card} onOpenChange={onClose}>
      {/* O DialogContent deve ser configurado para ser grande (max-w-4xl) */}
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-0">
        <DialogHeader className="p-6 border-b">
          <DialogTitle className="text-2xl font-bold">
            Prévia do Flashcard N° {card.id}
          </DialogTitle>
        </DialogHeader>

        {/* Corpo do Card (Frente, Verso e Tags) */}
        <div className="flex flex-1 overflow-hidden">
          
          {/* Lado Esquerdo: Frente (Pergunta) */}
          <div className="w-1/2 p-8 border-r flex flex-col">
            <h4 className="text-lg font-semibold mb-3 text-blue-600">Frente (Pergunta)</h4>
            <div className="flex-1 overflow-auto bg-blue-50 p-4 rounded-lg shadow-inner">
              {/* O 'whitespace-pre-wrap' é útil se o usuário usar quebras de linha no texto colado */}
              <p className="text-gray-800 text-base whitespace-pre-wrap leading-relaxed">
                {card.front}
              </p>
            </div>
          </div>

          {/* Lado Direito: Verso (Resposta) */}
          <div className="w-1/2 p-8 flex flex-col">
            <h4 className="text-lg font-semibold mb-3 text-green-600">Verso (Resposta)</h4>
            <div className="flex-1 overflow-auto bg-green-50 p-4 rounded-lg shadow-inner">
              <p className="text-gray-800 text-base whitespace-pre-wrap leading-relaxed">
                {card.back}
              </p>
            </div>
          </div>
        </div>

        {/* Tags no Centro Abaixo */}
        <div className="p-4 border-t text-center bg-gray-100 flex-shrink-0">
          <h4 className="text-sm font-semibold mb-2 text-gray-600">Tags</h4>
          <div className="flex flex-wrap justify-center gap-2">
            {card.tags.length > 0 ? (
              card.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))
            ) : (
              <p className="text-sm text-gray-500">Nenhuma tag</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};