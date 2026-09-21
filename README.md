# PetCare São Mateus - PWA

Petshop completo em formato de **Progressive Web App (PWA)**, desenvolvido com HTML, CSS e JavaScript puros (sem frameworks). Projeto educacional da **Etec São Mateus** - todos os dados (endereço, telefones e preços) são fictícios.

## Estrutura de arquivos

```
petcare-pwa/
├── index.html        → Página principal (todas as seções)
├── style.css         → Todo o CSS (mobile-first, Poppins)
├── script.js         → Todo o JavaScript (menu, formulário, SW...)
├── manifest.json     → Configuração do PWA
├── sw.js             → Service Worker (cache petcare-v1, Cache First)
├── icon-192.png      → Ícone do PWA (192x192)
├── icon-512.png      → Ícone do PWA (512x512)
├── hero-bg.jpg       → Imagem de fundo do hero
├── gerar-icones.py   → Script opcional para regenerar os ícones
└── README.md         → Este arquivo
```

## Como executar localmente

O Service Worker **exige um servidor** (não funciona abrindo o `index.html` direto do computador com `file://`). Escolha uma das opções:

**Opção 1 - Python (já vem instalado na maioria dos PCs):**
```bash
cd petcare-pwa
python -m http.server 8080
```
Acesse `http://localhost:8080`.

**Opção 2 - Node.js:**
```bash
cd petcare-pwa
npx serve .
```

**Opção 3 - VS Code:** instale a extensão **Live Server**, clique com o botão direito no `index.html` e escolha "Open with Live Server".

> Dica: para o site ser instalável, publique-o no **raiz do domínio** (ex.: `https://meusite.com/`), pois o `sw.js` e o cache usam caminhos absolutos como `/index.html`.

## Como gerar os ícones icon-192.png e icon-512.png

Os dois ícones **já estão incluídos** no projeto. Se quiser regenerá-los ou criar os seus, siga um dos métodos abaixo.

**Requisitos dos ícones:**
- Formato PNG
- Exatamente 192x192 pixels → `icon-192.png`
- Exatamente 512x512 pixels → `icon-512.png`
- Salvos na raiz do projeto (mesma pasta do `index.html`)
- Mesmo visual nos dois tamanhos (apenas redimensionado)

### Método 1 - Script Python incluído (gera o ícone oficial do projeto)

O projeto traz o script `gerar-icones.py`, que desenha automaticamente o ícone (fundo verde `#2E7D32`, círculo laranja `#FF8A65` e pata branca) nos dois tamanhos:

```bash
pip install pillow      # apenas na primeira vez
python gerar-icones.py
```

Saída: `icon-512.png` e `icon-192.png` gerados na mesma pasta.

### Método 2 - Ferramentas online (sem programar)

1. Crie um quadrado 512x512 no **Canva**, **Figma** ou **Photopea** com a logo do petshop (deixe margem de segurança de ~10% nas bordas).
2. Exporte como PNG.
3. Para redimensionar, use uma dessas ferramentas gratuitas:
   - **favicon.io/favicon-converter** - converte qualquer imagem em ícones;
   - **iliyangy.github.io/pwa-icon-generator** ou **app-manifest.firebaseapp.com** - geram os ícones 192 e 512 no formato exato do PWA;
   - **squoosh.app** - comprime o PNG sem perder qualidade.
4. Renomeie os arquivos para `icon-192.png` e `icon-512.png` e coloque-os na raiz do projeto.

### Método 3 - A partir de um emoji/logo com fundo

Em **favicon.io/favicon-generator** você digita um emoji (por exemplo, 🐾), escolhe a cor de fundo `#2E7D32` e baixa o pacote de ícones; depois basta renomear os PNGs de 192 e 512.

## Como instalar o PWA (para testar)

- **Android (Chrome):** abra o site → menu ⋮ → "Adicionar à tela inicial" → "Instalar".
- **iPhone/iPad (Safari):** botão Compartilhar → "Adicionar à Tela de Início".
- **Desktop (Chrome/Edge):** ícone de instalação na barra de endereço, ou menu → "Instalar PetCare...".

Quando instalado, o app abre em janela própria (display `standalone`), com ícone e cor de tema verde. As páginas principais ficam disponíveis **mesmo sem internet** graças ao Service Worker.

## Como funciona o PWA

- **manifest.json** define nome, ícones, cores e modo de exibição `standalone`.
- **sw.js** (Service Worker) usa a estratégia **Cache First**:
  - `install`: salva no cache `petcare-v1` os arquivos `/`, `/index.html`, `/style.css`, `/script.js`, `/manifest.json`, `/icon-192.png` e `/icon-512.png`;
  - `fetch`: responde primeiro pelo cache; se não encontrar, busca na rede;
  - `activate`: apaga caches antigos automaticamente ao publicar uma versão nova.
- **script.js** registra o Service Worker no carregamento da página.

### Atualizando o site no futuro

Ao alterar qualquer arquivo, **mude o nome do cache** em `sw.js` (ex.: `petcare-v2`) para forçar os visitantes a receberem a versão nova.

## Funcionalidades

- Header fixo com menu de navegação e menu mobile hamburger
- Hero com imagem de fundo, título e botão "Agende Agora"
- Seções de Serviços (5 cards), Produtos (8 cards com preços fictícios), Agendamento, Contato e Footer completo
- Formulário de agendamento com validação, máscara de telefone, bloqueio de datas passadas/domingos e mensagem de sucesso
- Scroll suave, botão "Voltar ao topo" e animações de entrada
- Design responsivo mobile-first (Poppins, verde #2E7D32 e laranja #FF8A65)
