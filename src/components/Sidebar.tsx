import React from "react";
import { Button } from "@/components/ui/button";
import { Settings, BookOpen, User, Menu, FileText, Bot } from "lucide-react";
import type { AppScreen } from "@/hooks/useNavigation";

import {
	Tooltip,
	TooltipTrigger,
	TooltipContent,
	TooltipProvider,
} from "@/components/ui/tooltip";

interface SidebarProps {
	currentScreen: AppScreen;
	navigateTo: (screen: AppScreen) => void;
	isSidebarOpen: boolean;
	toggleSidebar: () => void;
}

const navItems = [
	{ name: "Importar", screen: "importer" as AppScreen, icon: FileText },
	{ name: "Configurações", screen: "settings" as AppScreen, icon: Settings },
	{ name: "Como usar", screen: "how-to" as AppScreen, icon: BookOpen },
	{ name: "Prompts", screen: "prompts" as AppScreen, icon: Bot },
	{ name: "Conheça o Dev", screen: "about" as AppScreen, icon: User },
];

export const Sidebar: React.FC<SidebarProps> = ({
	currentScreen,
	navigateTo,
	isSidebarOpen,
	toggleSidebar,
}) => {
	const sidebarWidthClass = isSidebarOpen ? "w-56" : "w-20";

	return (
		<aside
			className={`flex flex-col h-screen ${sidebarWidthClass} bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-all duration-300 ease-in-out flex-shrink-0 z-30`}
		>
			{/* Header */}
			<div className="flex items-center justify-between h-16 px-4 border-b border-sidebar-border mt-3.5">
				<span
					className={`
						font-bold text-xl text-primary whitespace-nowrap overflow-hidden 
						transition-opacity duration-500
						${isSidebarOpen ? "opacity-100" : "opacity-0"}
					`}
				>
					Anki Importer
				</span>

				<TooltipProvider>
					<Tooltip 
					delayDuration={200}
					open={!isSidebarOpen ? undefined : false}
					onOpenChange={() => { }} // Bloqueia o fechamento automático se 'open' for definido
					>
						<TooltipTrigger asChild>
							<Button
								variant="ghost"
								size="icon"
								onClick={toggleSidebar}
								className="h-8 w-10 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
							>
								<Menu className="h-5 w-5" />
							</Button>
						</TooltipTrigger>

						{!isSidebarOpen && (
							<TooltipContent side="right" className="ml-1">
								Expandir
							</TooltipContent>
						)}

						{isSidebarOpen && (
							<TooltipContent side="right" className="ml-1">
								Recolher
							</TooltipContent>
						)}

					</Tooltip>
				</TooltipProvider>
			</div>

			{/* Navegação */}
			<TooltipProvider>
				<nav className="flex flex-col p-2 space-y-1 mt-4">
					{navItems.map((item) => {
						const isActive = item.screen === currentScreen;
						const Icon = item.icon;

						return (
							<Tooltip 
							key={item.screen} 
							delayDuration={200}
							open={!isSidebarOpen ? undefined : false} // Comportamento padrão (hover) se fechada; Força o fechamento se aberta.
							onOpenChange={() => { }} // Bloqueia o fechamento automático se 'open' for definido
							>
								<TooltipTrigger asChild>
									<Button
										onClick={() => navigateTo(item.screen)}
										className={`
											flex items-center justify-start h-10 rounded-lg transition-colors duration-300 w-full 
											${isActive
												? "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90 shadow-md"
												: "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
											}
										`}
										variant="ghost"
									>
										<div className="w-6 flex items-center justify-center ml-2">
											<Icon className="h-5 w-5" />
										</div>

										<span
											className={`
												ml-3 whitespace-nowrap overflow-hidden transition-all duration-400
												${isSidebarOpen ? "opacity-100" : "opacity-0"}
											`}
										>
											{item.name}
										</span>
									</Button>
								</TooltipTrigger>

								{/* Tooltip só aparece quando sidebar está fechada */}
								{!isSidebarOpen && (
									<TooltipContent side="right" className="ml-1">
										{item.name}
									</TooltipContent>
								)}
							</Tooltip>
						);
					})}
				</nav>
			</TooltipProvider>
		</aside>
	);
};
