import { useCallback } from 'react';

// Hook personalizado para abstrair a lógica de abrir links externos,
// priorizando a API do Electron para segurança, com fallback para o navegador.
export const useExternalLinkOpener = () => {
  const openExternalLink = useCallback((url: string) => {
    // Verifica se a API do Electron está disponível (se a aplicação estiver rodando no Electron).
    if (window.electronAPI && window.electronAPI.openExternal) {
      window.electronAPI.openExternal(url);
    } else {
      // Fallback padrão para abrir em uma nova aba do navegador.
      window.open(url, '_blank');
    }
  }, []);

  return { openExternalLink };
};