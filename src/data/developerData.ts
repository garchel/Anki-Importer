// Define a estrutura de dados para as informações do desenvolvedor.
export interface DeveloperInformation {
  name: string;
  nickname: string;
  bio: string;
  photoUrl: string;
  githubUrl: string;
  linkedinUrl: string;
  portfolioUrl: string;
  pixKey: string;
}

// Dados estáticos que foram extraídos do componente AboutScreen.
export const developerData: DeveloperInformation = {
  name: "Paulo Victor",
  nickname: "GarcheL",
  bio: "Desenvolvedor Full-Stack apaixonado por automatizar processos. Criei esta ferramenta para otimizar meu próprio uso do Anki e espero que seja útil para você também!",
  photoUrl: "./assets/foto3.jpg",
  githubUrl: "https://github.com/garchel",
  linkedinUrl: "https://www.linkedin.com/in/paulovictorco/",
  portfolioUrl: "https://paulovictor.vercel.app/",
  pixKey: "b02de26d-e173-41d0-a38f-3da4e2829574",
};