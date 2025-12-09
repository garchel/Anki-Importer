import { Code, Copy, Keyboard } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// Define a interface para um sub-passo dentro de um passo principal.
interface SubStep {
  id: string;
  text: string;
  highlightedText?: string;
  icon?: LucideIcon;
}

// Define a interface para um passo completo do tutorial.
export interface TutorialStepData {
  value: string; // Chave para o AccordionItem
  number: number;
  title: string;
  icon?: string; // Ícone principal (ex: 🔌, ⚙️, ✨)
  introDescription: string;
  subStepsTitle: string;
  content: SubStep[];
  isUsageFlow?: boolean; // Para aplicar um estilo visual diferente para o fluxo de uso
}

// Dados estáticos que definem o conteúdo de cada passo do tutorial (SRP).
export const TUTORIAL_STEPS: TutorialStepData[] = [
  // --- PASSO 1: INSTALAÇÃO ---
  {
    value: "installation",
    number: 1,
    title: "Instalar o Anki Connect",
    icon: "🔌",
    introDescription:
      'O Anki Connect é um plugin essencial para que este programa se comunique com o seu Anki.',
    subStepsTitle: "Passos de Instalação:",
    content: [
      {
        id: "1.1",
        text: 'Abra o seu Anki e vá em Ferramentas > Extensões > Obter Extensões.',
        highlightedText: 'Ferramentas > Extensões > Obter Extensões',
      },
      {
        id: "1.2",
        text: 'Cole o código: 2055492159 e clique em OK.',
        highlightedText: '2055492159',
      },
      {
        id: "1.3",
        text: 'Reinicie o Anki.',
      },
    ],
  },

  // --- PASSO 2: CONFIGURAÇÃO ---
  {
    value: "configuration",
    number: 2,
    title: "Configurar o AnkiConnect",
    icon: "⚙️",
    introDescription:
      'Você precisa adicionar o seu computador à lista de domínios permitidos do Anki Connect. Use o gerador no Passo 2 para garantir a configuração correta.',
    subStepsTitle: "Onde colar o código:",
    content: [
      {
        id: "2.1",
        text: 'No Anki, vá em Ferramentas > Extensões > Clique duplo em "AnkiConnect".',
        highlightedText: 'Ferramentas > Extensões > Clique duplo em "AnkiConnect"',
      },
      {
        id: "2.2",
        text: 'Apague o conteúdo existente e cole o texto JSON que você copiou acima.',
        highlightedText: 'cole o texto JSON',
      },
      {
        id: "2.3",
        text: 'Clique em OK.',
      },
    ],
  },

  // --- PASSO 3: COMO UTILIZAR ---
  {
    value: "usage",
    number: 3,
    title: "Como Utilizar o Importador",
    icon: "✨",
    introDescription:
      'Com o Anki e o programa funcionando em segundo plano, importar flashcards é um processo de apenas 3 passos rápidos.',
    subStepsTitle: "Fluxo de Trabalho Simplificado:",
    isUsageFlow: true,
    content: [
      {
        id: "3.1",
        text: 'Use a sessão Prompts para gerar seus flashcards usando alguma IA.',
        highlightedText: 'Prompts',
        icon: Code,
      },
      {
        id: "3.2",
        text: 'Selecione e copie todo o texto dos flashcards gerados (incluindo as quebras de linha).',
        highlightedText: 'Selecione e copie',
        icon: Copy,
      },
      {
        id: "3.3",
        text: 'Com o texto copiado, digite a tecla de atalho configurada (Control+G por padrão) para importar instantaneamente.',
        highlightedText: 'Control+G',
        icon: Keyboard,
      },
    ],
  },
];