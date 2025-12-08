// AboutScreen.tsx

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Github, Linkedin, Link, Copy, Check, HeartHandshake } from 'lucide-react';

const AboutScreen: React.FC = () => {
	const devInfo = {
		name: "Paulo Victor",
		bio: "Desenvolvedor Full-Stack apaixonado por automatizar processos. Criei esta ferramenta para otimizar meu próprio uso do Anki e espero que seja útil para você também!",
		photoUrl: "/assets/foto.jpg",
		github: "https://github.com/garchel",
		linkedin: "https://www.linkedin.com/in/paulovictorco/",
		portfolio: "https://paulovictor.vercel.app/",
		pixKey: "b02de26d-e173-41d0-a38f-3da4e2829574", 
	};

	const [copied, setCopied] = useState(false);

	const handleCopyPix = useCallback(() => {
		navigator.clipboard.writeText(devInfo.pixKey);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	}, [devInfo.pixKey]);

	return (
		<div className="p-6 max-w-6xl scrollbar-hide mx-auto">
			<h1 className="text-3xl font-bold text-foreground mb-5">Conheça o Desenvolvedor</h1>
			<hr className="mb-6 border-border " />

			<Card className="p-6">
				<CardHeader className="flex flex-col items-center p-0 mb-6">
					{/* Foto Circular Centralizada */}
					<img
						src={devInfo.photoUrl}
						alt={devInfo.name}
						className="w-32 h-32 rounded-full object-cover border-4 border-orange-500 shadow-xl mb-4"
					/>

					<CardTitle className="text-3xl font-extrabold text-center">{devInfo.name} <span className='text-orange-500 italic '>"GarcheL"</span></CardTitle>
				</CardHeader>

				<CardContent className="p-0">
					{/* Biografia */}
					<p className="text-center text-muted-foreground max-w-xl mx-auto mb-3 ">
						{devInfo.bio}
					</p>
					<p className='text-gray-200 font-semibold text-center mx-auto mb-8'>Me recomenda no seu trabalho!!(sou legal)</p>

					<hr className="mb-6 border-border  border-neutral-800" />

					{/* Links Sociais e Profissionais */}
					<div className="flex flex-wrap justify-center gap-4 mb-8">
						<Button variant="outline" asChild>
							<a href={devInfo.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2  hover:text-orange-500">
								<Github className="w-4 h-4" /> GitHub
							</a>
						</Button>
						<Button variant="outline" asChild>
							<a href={devInfo.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2  hover:text-orange-500">
								<Linkedin className="w-4 h-4" /> LinkedIn
							</a>
						</Button>
						<Button variant="outline" asChild>
							<a href={devInfo.portfolio} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2  hover:text-orange-500">
								<Link className="w-4 h-4" /> Portfólio
							</a>
						</Button>
					</div>

					<hr className="mb-6 border-border border-neutral-800" />

					{/* Chave Pix (Contribuição) */}
					<div className="text-center p-4 bg-yellow-50/50 dark:bg-yellow-900/10 border border-border rounded-lg shadow-inner">
						<h3 className="text-xl font-semibold mb-2 flex items-center justify-center gap-2 text-yellow-600 dark:text-yellow-400">
							<HeartHandshake className="w-5 h-5" /> Apoie o Desenvolvimento
						</h3>
						<p className="text-sm text-muted-foreground mb-3">
							Este projeto é de código aberto. Se você gostou da ferramenta e deseja contribuir com o desenvolvimento:
						</p>
						<div className="inline-flex items-center bg-input p-3 rounded-md border border-dashed border-primary/50">
							<span className="font-mono text-sm text-foreground select-text mr-3">{devInfo.pixKey}</span>
							<Button
								onClick={handleCopyPix}
								variant="ghost"
								size="icon"
								className="h-8 w-8 text-primary hover:bg-primary/10  hover:text-orange-500"
								title="Copiar Chave Pix"
							>
								{copied ? (
									<Check className="h-4 w-4 text-green-500" />
								) : (
									<Copy className="h-4 w-4" />
								)}
							</Button>
						</div>
						<p className="mt-2 text-xs text-secondary-foreground">Chave Pix (Copie e cole no seu banco)</p>
					</div>

				</CardContent>
			</Card>
		</div>
	);
};

export default AboutScreen;