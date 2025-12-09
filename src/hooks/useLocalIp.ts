// Hook simples para obter e exportar o endereço de IP local padrão.
// Útil para centralizar valores constantes e garantir a SRP do componente Card.
export const useLocalIp = () => {
  // 127.0.0.1 é a referência segura de IP local (localhost).
  const localIp = '127.0.0.1';
  return { localIp };
};