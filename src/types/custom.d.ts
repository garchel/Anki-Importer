// src/types/custom.d.ts

// Estende a interface global React.CSSProperties para adicionar a propriedade WebkitAppRegion
declare global {
	namespace React {
		interface CSSProperties {
			/**
			 * Propriedade específica do Electron para definir áreas arrastáveis e não arrastáveis.
			 */
			WebkitAppRegion?: "drag" | "no-drag";
		}
	}
}

// O restante do arquivo deve estar vazio.
