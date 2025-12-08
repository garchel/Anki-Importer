# ⚡ Anki Importer

**Otimize seu estudo no Anki capturando texto instantaneamente de qualquer aplicativo!**

---

## ✨ Visão Geral

O Anki Importer é um aplicativo desktop (Windows/macOS/Linux) desenvolvido em Electron, React e Vite. Ele foi criado para automatizar e acelerar o processo de criação de flashcards no Anki, permitindo que você capture rapidamente textos de navegadores, PDFs, ou qualquer outra aplicação com um **único atalho global**.

Chega de copiar, abrir o Anki, criar um novo card, colar, e repetir.

---

## ⬇️ Download e Instalação

Você pode baixar e instalar a versão mais recente do Anki Importer diretamente pelo link abaixo.

| Sistema Operacional | Arquivo de Instalação |
| :--- | :--- |
| **Windows (.exe)** | [Link para o Anki Importer Setup v0.0.0.exe](LINK_PARA_O_SEU_ARQUIVO_NO_GITHUB_RELEASES) |
| **macOS (.dmg)** | [Link para o Anki Importer Setup v0.0.0.dmg](LINK_PARA_O_SEU_ARQUIVO_NO_GITHUB_RELEASES) |
| **Linux (.deb/.AppImage)** | [Link para o pacote Linux](LINK_PARA_O_SEU_ARQUIVO_NO_GITHUB_RELEASES) |

**Instruções de Instalação:**
1. Baixe o arquivo de instalação (ex: `.exe` para Windows).
2. Execute o instalador e siga as instruções na tela.
3. O aplicativo será iniciado e ficará rodando em segundo plano (na bandeja do sistema).

---

## 💡 Como Funciona

O aplicativo utiliza um atalho global configurável para agilizar o fluxo de trabalho:

### 1. Fluxo de Captura
1. **Selecione o Texto:** Em qualquer aplicativo (navegador, PDF, documento), selecione o texto que você deseja transformar em flashcard.
2. **Copie o Texto:** Use o atalho de cópia padrão do sistema (**`Ctrl + C`** ou **`Cmd + C`**).
3. **Ative o Importer:** Pressione o atalho global configurado (**Padrão: `Ctrl + G`** ou **`Cmd + G`**).

### 2. Ação do Aplicativo
Ao pressionar o atalho, o Anki Importer faz o seguinte:
* **Foca a Janela:** Traz a interface principal do Importer para o primeiro plano.
* **Lê o Clipboard:** Captura o texto que você acabou de copiar.
* **Preenche o Formulário:** O texto capturado é inserido automaticamente no campo de importação, pronto para ser processado e formatado para o Anki.

---

## ⚙️ Configurações Principais

O aplicativo permite personalizar diversos aspectos do seu fluxo de trabalho:

* **Atalho Global:** Defina um novo atalho de teclado para chamar o aplicativo (padrão: `Ctrl/Cmd + G`).
* **Modelo e Baralho Padrão:** Escolha o **Modelo de Cartão** (`Básico`, `Omissão de Palavras`, etc.) e o **Baralho** (`Default`, etc.) que serão predefinidos na importação.
* **Delimitadores:** Configure os delimitadores de campo que você usa para formatar o texto copiado (ex: `;` ou `|`).

---

## ⌨️ Desenvolvimento e Contribuição

Este projeto é open-source. Sinta-se à vontade para inspecionar o código, relatar bugs ou sugerir melhorias.

### Tecnologias Utilizadas
* **Frontend:** React, Vite, TypeScript
* **Estilização:** Tailwind CSS, Shadcn/ui
* **Backend / Desktop:** Electron, Node.js
* **Empacotamento:** Electron Builder

### Como Executar em Desenvolvimento

1.  Clone o repositório:
    ```bash
    git clone [LINK_DO_SEU_REPO]
    cd anki-importer
    ```
2.  Instale as dependências:
    ```bash
    npm install
    ```
3.  Inicie o servidor de desenvolvimento do Vite (Frontend):
    ```bash
    npm run dev
    ```
4.  Em outro terminal, inicie o Electron (Backend):
    ```bash
    npm run start
    ```

---

## 📜 Licença

Distribuído sob a licença MIT. Veja `LICENSE` para mais informações.