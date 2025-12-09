import type { FieldDelimiter } from '../components/context/SettingsContext';

// --- Opções Estáticas ---

export const WINDOW_RESOLUTIONS = [
  { width: 800, height: 600, label: 'Pequena' },
  { width: 1024, height: 768, label: 'Média' },
  { width: 1280, height: 800, label: 'Grande' },
  { width: 1440, height: 900, label: 'Extra Grande' },
];

export const DELIMITER_OPTIONS: { value: FieldDelimiter; label: string }[] = [
  { value: ';', label: ';  (Ponto e Vírgula)' },
  { value: '|', label: '|  (Pipe)' },
  { value: '//', label: '//  (Barras Duplas)' },
];

export const MODIFIER_OPTIONS = [
  { value: 'Control', label: 'Control/Command' },
  { value: 'Alt', label: 'Alt' },
  { value: 'Shift', label: 'Shift' },
];