import React from 'react';
import { Accordion } from '@/components/ui/accordion';
import { Separator } from '@/components/ui/separator';
import { TUTORIAL_STEPS } from '@/data/tutorialData';
import TutorialStep from '@/components/screens/HowTo/TutorialStep';

// A tela agora é responsável por organizar a estrutura e iterar sobre os dados (SRP).
const HowToScreen: React.FC = () => (
	<div className="p-6 max-w-6xl scrollbar-hide mx-auto">
		<h1 className="text-3xl font-bold text-foreground mb-2">Guia Completo</h1>
		<Separator className="mb-6" />
		<p className="mt-2 text-lg text-muted-foreground mb-8">
			Siga os <span className='font-bold text-gray-300'>passos essenciais</span> abaixo para conectar e <span className='font-bold text-gray-300'>começar a importar</span> flashcards com agilidade.
		</p>

		<Accordion type="single" collapsible className="w-full space-y-4">
			{/* Itera sobre os dados e renderiza cada passo usando o componente genérico */}
			{TUTORIAL_STEPS.map((step) => (
				<TutorialStep key={step.value} step={step} />
			))}
		</Accordion>

	</div>
);

export default HowToScreen;