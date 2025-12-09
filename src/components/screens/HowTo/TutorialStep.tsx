import React from 'react';
import {
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from '@/components/ui/accordion';
import type { TutorialStepData } from '@/data/tutorialData';
import { AnkiConnectConfigCard } from './AnkiConnectConfigCard'; 
import { Separator } from '@/components/ui/separator';

interface TutorialStepProps {
	step: TutorialStepData;
}

// Componente genérico para renderizar um item do tutorial (DRY e SRP).
const TutorialStep: React.FC<TutorialStepProps> = ({ step }) => {
	// Define classes de estilo condicionalmente
	const containerClasses = step.isUsageFlow
		? 'mt-4 space-y-4 p-4 border rounded-md bg-green-900/10 border-green-700/30'
		: 'space-y-3 p-3 border rounded-md bg-secondary/30';

	const stepContainerClasses = 'border rounded-lg px-4 bg-card/50';

	// Função auxiliar para substituir o texto destacado na string
	const renderSubStepText = (text: string, highlight?: string) => {
		if (!highlight) {
			return text;
		}

		// Expressão regular para encontrar o texto exato a ser destacado.
		// O texto ' > ' é transformado em '&gt;' na UI, mas não na string de dados.
		const parts = text.split(highlight);
		if (parts.length === 1) {
			return text;
		}

		return (
			<>
				{parts.map((part, index) => (
					<React.Fragment key={index}>
						{/* Renderiza a parte do texto antes ou entre os destaques */}
						{part.trim()}
						{/* Se não for a última parte, renderiza o destaque */}
						{index < parts.length - 1 && (
							<span className='font-bold text-gray-300'>
								{/* Substitui '>' por ' > ' para formatar melhor o texto de caminho */}
								{highlight.replace(/>/g, ' > ')}
							</span>
						)}
					</React.Fragment>
				))}
			</>
		);
	};

	return (
		<AccordionItem value={step.value} className={stepContainerClasses}>
			<AccordionTrigger className="text-xl font-semibold hover:no-underline">
				<div className="flex items-center gap-3">
					<span className="text-2xl font-extrabold text-primary">{step.number}</span>
					{step.title} {step.icon}
				</div>
			</AccordionTrigger>

			<AccordionContent className="pb-4 pt-2">
				<p className="text-muted-foreground mb-4">
					{step.introDescription}
				</p>

				{/* Renderiza o card de configuração do AnkiConnect apenas no Passo 2 */}
				{step.number === 2 && (
					<AnkiConnectConfigCard />
				)}

				<div className={step.number === 2 ? 'mt-6' : ''}>
					<div className={containerClasses}>
						<span className={`font-bold block text-sm mb-2 ${step.isUsageFlow ? 'text-lg text-green-300' : 'text-foreground'}`}>
							{step.subStepsTitle}:
						</span>

						{step.content.map((subStep, index) => (
							<React.Fragment key={subStep.id}>
								{step.isUsageFlow ? (
									/* Formato estilizado para o Fluxo de Uso (Passo 3) */
									<div className="flex items-start gap-3">
										{subStep.icon && <subStep.icon className="w-5 h-5 mt-0.5 text-primary flex-shrink-0" />}
										<div>
											<p className="text-sm font-semibold text-foreground">
												{subStep.id}. {subStep.text.split('(')[0].trim()}
											</p>
											<p className="text-xs text-muted-foreground mt-0.5">
												{renderSubStepText(subStep.text, subStep.highlightedText)}
											</p>
										</div>
									</div>
								) : (
									/* Formato padrão para Instalação/Configuração (Passos 1 e 2) */
									<p className="text-sm text-foreground/80 flex items-start gap-2">
										<span className="text-primary font-bold">{subStep.id}.</span>
										{renderSubStepText(subStep.text, subStep.highlightedText)}
									</p>
								)}

								{/* Separador Visual apenas entre os sub-passos do Fluxo de Uso */}
								{step.isUsageFlow && index < step.content.length - 1 && (
									<Separator className="border-green-700/30" />
								)}
							</React.Fragment>
						))}
					</div>
				</div>
			</AccordionContent>
		</AccordionItem>
	);
};

export default TutorialStep;