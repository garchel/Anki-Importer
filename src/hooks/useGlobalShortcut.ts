import { useState, useEffect, useCallback } from 'react';
import { useSettings } from '../components/context/SettingsContext';

const DEFAULT_SHORTCUT = 'Control+G';

// Hook para gerenciar toda a lógica do atalho global (captura de tecla, estados locais, salvamento) (SRP).
export const useGlobalShortcut = () => {
  const { settings, updateSettings } = useSettings();
  
  // Divide o atalho global em modificador e chave inicial
  const currentShortcutParts = settings.globalShortcut.split('+');
  const initialModifier = currentShortcutParts.length > 1 ? currentShortcutParts[0] : 'Control';
  const initialKey = currentShortcutParts.length > 1 ? currentShortcutParts[1] : 'G';

  const [modifier, setModifier] = useState(initialModifier);
  const [key, setKey] = useState(initialKey);
  const [isListening, setIsListening] = useState(false);

  // Sincroniza estados locais quando o atalho global muda (vindo de fora ou na montagem)
  useEffect(() => {
    const parts = settings.globalShortcut.split('+');
    setModifier(parts.length > 1 ? parts[0] : 'Control');
    setKey(parts.length > 1 ? parts[1] : 'G');
  }, [settings.globalShortcut]);

  // Função para salvar o novo atalho
  const handleSave = useCallback(() => {
    if (key === '...') return;
    const newShortcut = `${modifier}+${key.toUpperCase()}`;
    updateSettings({ globalShortcut: newShortcut });
  }, [modifier, key, updateSettings]);

  // Função para redefinir o atalho para o padrão
  const handleReset = useCallback(() => {
    setModifier('Control');
    setKey('G');
    updateSettings({ globalShortcut: DEFAULT_SHORTCUT });
  }, [updateSettings]);

  // --- Lógica de Captura de Tecla ---

  const handleFocus = useCallback(() => {
    setIsListening(true);
    setKey('...'); // Limpa o campo visualmente
  }, []);

  const handleBlur = useCallback(() => {
    setIsListening(false);
    // Restaura a tecla original se o usuário não digitou nada
    if (key === '...') {
      const parts = settings.globalShortcut.split('+');
      setKey(parts.length > 1 ? parts[1] : 'G');
    }
  }, [key, settings.globalShortcut]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    e.preventDefault(); 
    e.stopPropagation();

    if (!isListening) return;

    let pressedKey = e.key;

    // Ignora modificadores puros
    if (['Control', 'Alt', 'Shift', 'Meta'].includes(pressedKey)) {
      return;
    }

    // Tratamento especial para o ' ' (espaço)
    if (pressedKey === ' ') {
      pressedKey = 'Space';
    }

    // Converte e atualiza
    setKey(pressedKey.toUpperCase());
    setIsListening(false);
  }, [isListening]);

  // Verifica se o atalho atual (local) é o mesmo que o salvo (global)
  const isModified = settings.globalShortcut !== `${modifier}+${key.toUpperCase()}`;
  const isDefault = settings.globalShortcut === DEFAULT_SHORTCUT;

  return {
    modifier,
    setModifier,
    key,
    setKey,
    isListening,
    handleSave,
    handleReset,
    handleFocus,
    handleBlur,
    handleKeyDown,
    isModified,
    isDefault,
  };
};