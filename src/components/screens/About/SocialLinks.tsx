import React from 'react';
import { Button } from '@/components/ui/button';
import { Github, Linkedin, Link } from 'lucide-react';
import { useExternalLinkOpener } from '@/hooks/useExternalLinkOpener';
import type { DeveloperInformation } from '@/data/developerData';

interface SocialLinksProps {
	developer: DeveloperInformation;
}

// Componente responsável por renderizar os botões de links sociais e profissionais (SRP).
const SocialLinks: React.FC<SocialLinksProps> = ({ developer }) => {
	const { openExternalLink } = useExternalLinkOpener();

	const links = [
		{ icon: Github, label: "GitHub", url: developer.githubUrl },
		{ icon: Linkedin, label: "LinkedIn", url: developer.linkedinUrl },
		{ icon: Link, label: "Portfólio", url: developer.portfolioUrl },
	];

	return (
		<div className="flex flex-wrap justify-center gap-4 mb-8">
			{links.map((link) => (
				<Button
					key={link.label}
					variant="outline"
					onClick={() => openExternalLink(link.url)}
					className="flex items-center gap-2 hover:text-orange-500"
				>
					<link.icon className="w-4 h-4" /> {link.label}
				</Button>
			))}
		</div>
	);
};

export default SocialLinks;