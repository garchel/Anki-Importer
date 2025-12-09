import { useEffect, useRef } from 'react';
import { defaultSettings } from '@/types/settings';
import type { AppSettings } from '@/types/settings';

interface UseWindowResizeEffectProps {
  settings: AppSettings;
}

// Hook responsável por comunicar o Electron quando o tamanho da janela muda (SRP).
export const useWindowResizeEffect = ({ settings }: UseWindowResizeEffectProps) => {
  // Ref para rastrear o tamanho anterior que foi setado pelo Electron, 
  // evitando chamadas redundantes para o Electron.
  const lastElectronSizeRef = useRef({
    width: defaultSettings.windowWidth,
    height: defaultSettings.windowHeight,
  });

  useEffect(() => {
    // 1. Verifica a disponibilidade da API do Electron
    if (!window.electronAPI || !window.electronAPI.updateWindowSize) {
      return;
    }

    const { windowWidth: newWidth, windowHeight: newHeight } = settings;

    // 2. Verifica se houve realmente uma mudança nos settings (ignorando o que o Electron já aplicou)
    const hasChanged =
      newWidth !== lastElectronSizeRef.current.width ||
      newHeight !== lastElectronSizeRef.current.height;

    if (!hasChanged) {
      return;
    }

    // 3. Chama a API do Electron para aplicar o novo tamanho
    window.electronAPI.updateWindowSize({
      width: newWidth,
      height: newHeight,
    });

    // 4. Atualiza a referência
    lastElectronSizeRef.current = {
      width: newWidth,
      height: newHeight,
    };
  }, [settings.windowWidth, settings.windowHeight]);
};