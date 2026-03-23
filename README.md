# PhysioFlow 🏋️

**Reabilitação física de uma forma mais fácil** — uma aplicação web interativa que usa a câmara do utilizador e inteligência artificial para guiar exercícios de reabilitação física em tempo real.

---

## Descrição

O **PhysioFlow** é uma ferramenta de reabilitação assistida por visão computacional. O utilizador posiciona-se em frente à câmara e a aplicação deteta os movimentos do corpo usando o modelo **MoveNet** (via **ml5.js**), verificando se a pose está correta e contando as repetições automaticamente.

---

## Funcionalidades

- 🎯 **Deteção de pose em tempo real** com MoveNet (ml5.js + p5.js)
- 💪 **3 zonas de reabilitação** disponíveis:
  - **Braquial** — Ombros e braços (Elevação em T, Elevação em V, Goalpost U)
  - **Dorsal** — Costas e coluna superior (Mãos na Nuca, W-Pose, Remada Alta)
  - **Lombar** — Coluna lombar e core (Inclinação Esq/Dir, Mãos nas Ancas, Braços ao Céu)
- 📊 **Contagem automática de repetições** com barra de progresso
- 🗂️ **Histórico de sessões** com highscore por zona e sistema de estrelas
- 🧍 **Bonequinho guia** que mostra visualmente como fazer cada pose
- ⏱️ **Descanso automático** de 1.5 segundos entre poses

---

## Tecnologias Utilizadas

| Tecnologia | Versão | Uso |
|---|---|---|
| [p5.js](https://p5js.org/) | 1.9.0 | Renderização gráfica e canvas |
| [ml5.js](https://ml5js.org/) | latest | Deteção de pose com MoveNet |
| HTML5 / CSS3 / JavaScript | — | Estrutura e lógica da aplicação |

---

## Como Usar

### Requisitos
- Navegador moderno com suporte a WebRTC (Chrome, Firefox, Edge)
- Webcam funcional
- Boa iluminação ambiente

### Passos
1. Abre o ficheiro `index.html` num servidor local (ex: [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) no VS Code)
2. Permite o acesso à câmara quando solicitado
3. Clica em **INICIAR TREINO**
4. Escolhe a zona de reabilitação
5. Fica de pé a **1–2 metros** da câmara, com o corpo bem visível
6. Imita a pose mostrada pelo bonequinho durante **1 segundo** para contar a repetição
7. Descansa 1.5 segundos e repete!

> ⚠️ **Nota:** Abre sempre via servidor local (nunca diretamente pelo sistema de ficheiros), pois a câmara requer `localhost` ou `https`.

---

## Estrutura do Projeto

```
ProjetoTI/
├── index.html      # Ponto de entrada da aplicação
├── sketch.js       # Lógica principal (p5.js + ml5.js + MoveNet)
├── style.css       # Estilos da página
└── README.md       # Este ficheiro
```

---

## Exercícios Disponíveis

### 💪 Braquial
| Pose | Descrição |
|---|---|
| Elevação em T | Braços abertos horizontalmente |
| Elevação em V | Mãos acima da cabeça em V |
| Goalpost (U) | Cotovelos dobrados para cima |

### 🔙 Dorsal
| Pose | Descrição |
|---|---|
| Mãos na Nuca | Cotovelos altos e abertos |
| W-Pose | Cotovelos para baixo e para fora |
| Remada Alta | Puxa os cotovelos para cima |

### 🦴 Lombar
| Pose | Descrição |
|---|---|
| Inclinação Esq | Inclina o tronco para a esquerda |
| Inclinação Dir | Inclina o tronco para a direita |
| Mãos nas Ancas | Cotovelos para fora |
| Braços ao Céu | Estica-te todo para cima |

---

## Autor

Desenvolvido por **Timóteo Gres** — não roubem. 🙂