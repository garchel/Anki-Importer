// HowToScreen.tsx

import React from 'react';
// Importamos o Accordion do shadcn/ui
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from '@/components/ui/accordion';
// O Separator foi removido pois o Accordion já separa os blocos
import { AnkiConnectConfigCard } from './AnkiConnectConfigCard'; // Componente mantido

const HowToScreen: React.FC = () => (
	<div className="p-6 max-w-6xl scrollbar-hide mx-auto">
		<h1 className="text-3xl mb-5 font-bold text-foreground mb-2">Como Instalar</h1>
		<hr className="mb-6 border-border" />
		<p className="mt-2 text-lg text-muted-foreground mb-8">
			Siga os <span className='font-bold text-gray-300'> passos essenciais</span> abaixo para conectar o programa ao seu Anki e começar a importar.
		</p>

		<Accordion type="single" collapsible className="w-full space-y-4">
			{/* --- PASSO 1: INSTALAÇÃO --- */}
			<AccordionItem value="item-1" className="border rounded-lg px-4 bg-card/50">
				<AccordionTrigger className="text-xl font-semibold hover:no-underline">
					<div className="flex items-center gap-3">
						<span className="text-2xl font-extrabold text-primary">1</span>
						Instalar o Anki Connect 🔌
					</div>
				</AccordionTrigger>
				<AccordionContent className="pb-4 pt-2">
					<p className="text-muted-foreground mb-4">
						O <span className='font-bold text-gray-300'>Anki Connect</span> é um plugin <span className='font-bold text-gray-300'>essencial</span> para que este programa se comunique com o seu Anki.
					</p>

					<div className="space-y-3 p-3 border rounded-md bg-secondary/30">
						<span className="font-bold block text-sm text-foreground mb-2">Passos de Instalação:</span>

						{/* Passo 1.1 CORRIGIDO: Substituído > por &gt; */}
						<p className="text-sm text-foreground/80 flex items-start gap-2">
							<span className="text-primary font-bold">1.1.</span>
							Abra o seu Anki e vá em <span className='font-bold text-gray-300'>Ferramentas &gt; Extensões &gt; Obter Extensões</span>.
						</p>

						{/* Passo 1.2 */}
						<p className="text-sm text-foreground/80 flex items-start gap-2">
							<span className="text-primary font-bold">1.2.</span>
							Cole o código: <span className="font-bold text-primary bg-primary/20 px-2 py-0.5 rounded transition-colors duration-150 hover:bg-primary/30">2055492159</span> e clique em <span className='font-bold text-gray-300'>OK</span>.
						</p>

						{/* Passo 1.3 */}
						<p className="text-sm text-foreground/80 flex items-start gap-2">
							<span className="text-primary font-bold">1.3.</span>
							Reinicie o Anki.
						</p>
					</div>

					{/* <p className="mt-4 text-xs text-primary/80 bg-primary/5 p-3 rounded-md border border-primary/20">
						<span className="font-bold">Atenção:</span> O Anki deve estar <span className='font-bold text-primary'>sempre aberto</span>  ao tentar importar flashcards.
					</p> */}
				</AccordionContent>
			</AccordionItem>

			{/* --- PASSO 2: CONFIGURAÇÃO --- */}
			<AccordionItem value="item-2" className="border rounded-lg px-4 bg-card/50">
				<AccordionTrigger className="text-xl font-semibold hover:no-underline">
					<div className="flex items-center gap-3">
						<span className="text-2xl font-extrabold text-primary">2</span>
						Configurar o IP Local ⚙️
					</div>
				</AccordionTrigger>
				<AccordionContent className="pb-4 pt-2">
					<p className="text-muted-foreground mb-6">
						Você precisa adicionar o endereço de rede do seu computador à lista de domínios permitidos do Anki Connect. Use o gerador abaixo para garantir a configuração correta:
					</p>

					{/* CARD COM O JSON DE CONFIGURAÇÃO */}
					<AnkiConnectConfigCard />

					{/* Lista estilizada para o Passo 2 */}
					<div className="mt-6 space-y-3 p-3 border rounded-md bg-secondary/30">
						<span className="font-bold block text-sm text-foreground mb-2">Onde colar o código:</span>

						{/* Passo 2.1 CORRIGIDO: Substituído > por &gt; */}
						<p className="text-sm text-foreground/80 flex items-start gap-2">
							<span className="text-primary font-bold">2.1.</span> No Anki, vá em <span className='font-bold text-gray-300'>Ferramentas &gt; Extensões &gt; AnkiConnect &gt; Configurações</span>.
						</p>

						{/* Passo 2.2 */}
						<p className="text-sm text-foreground/80 flex items-start gap-2">
							<span className="text-primary font-bold">2.2.</span>
							Apague o conteúdo existente e <span className='font-bold text-gray-300'>cole o texto JSON</span> que você copiou acima.
						</p>

						{/* Passo 2.3 */}
						<p className="text-sm text-foreground/80 flex items-start gap-2">
							<span className="text-primary font-bold">2.3.</span>
							Clique em <span className='font-bold text-gray-300'>OK</span>.
						</p>
					</div>
				</AccordionContent>
			</AccordionItem>
		</Accordion>

	</div>
);

export default HowToScreen;