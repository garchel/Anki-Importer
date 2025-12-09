import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { developerData } from '@/data/developerData';
import SocialLinks from '@/components/screens/About/SocialLinks';
import SupportSection from '@/components/screens/About/SupportSection';

const AboutScreen: React.FC = () => {
	// A tela principal agora foca na montagem da estrutura e no fluxo de dados.
	const { name, nickname, bio, photoUrl, pixKey } = developerData;

	return (
		<div className="p-6 max-w-6xl scrollbar-hide mx-auto">
			<h1 className="text-3xl font-bold text-foreground mb-5">Conheça o Desenvolvedor</h1>
			<Separator className="mb-6" />

			<Card className="p-6">
				<CardHeader className="flex flex-col items-center p-0 mb-6">
					{/* Foto Circular Centralizada */}
					<img
						src={photoUrl}
						alt={name}
						className="size-40 rounded-full object-cover border-4 border-orange-500 shadow-xl mb-4"
					/>

					<CardTitle className="text-3xl font-extrabold text-center">
						{name} <span className='text-orange-500 italic '>"{nickname}"</span>
					</CardTitle>
				</CardHeader>

				<CardContent className="p-0">
					{/* Biografia */}
					<p className="text-center text-muted-foreground max-w-xl mx-auto mb-3 ">
						{bio}
					</p>
					<p className='text-gray-200 font-semibold text-center mx-auto mb-8'>Me recomenda no seu trabalho!!(sou legal)</p>

					<Separator className="mb-6 border-neutral-800" />

					{/* Links Sociais e Profissionais (Componente modularizado) */}
					<SocialLinks developer={developerData} />

					<Separator className="mb-6 border-neutral-800" />

					{/* Chave Pix (Contribuição) (Componente modularizado) */}
					<SupportSection pixKey={pixKey} />
				</CardContent>
			</Card>
		</div>
	);
};

export default AboutScreen;