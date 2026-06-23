# Sistema de cores — Controlaí

Cada **funcionalidade** do app tem **uma cor fixa**. Toda nova funcionalidade, ou
nova aba inserida dentro de uma funcionalidade existente, **obedece a cor já
definida** para aquela área. Quando há aninhamento (uma aba dentro de outra aba),
o nível filho usa uma versão **um pouco mais clara** da cor do pai — e assim por
diante, clareando a cada nível.

## As 6 cores funcionais

| Funcionalidade | Significado | Cor base | Token CSS |
|---|---|---|---|
| **Início** | Dashboard / visão geral | `#b7ffa9` (verde) | `--fn-home` |
| **Gravação** | Gravar / anexar / transcrever | `#ffd439` (amarelo) | `--fn-record` |
| **Relatórios** | Relatórios e análises | `#ffc7ab` (coral) | `--fn-reports` |
| **Calendário** | Eventos, prazos, tarefas | `#ebcefd` (lilás) | `--fn-calendar` |
| **Funções ("Mais")** | Widgets e ferramentas | `#9fc8fe` (azul) | `--fn-tools` |
| **Conta** | Perfil, configurações, suporte, notificações | `#ffb5f1` (rosa) | `--fn-account` |

## Regra de aninhamento (clareia por nível)

A cor da funcionalidade é definida no contêiner-raiz da área com uma classe
`fn-*`. Os níveis usam `color-mix` para clarear progressivamente:

- **Nível 1** (`.fn-l1`) — a própria funcionalidade: cor base.
- **Nível 2** (`.fn-l2`) — aba dentro da funcionalidade: ~16% mais clara.
- **Nível 3** (`.fn-l3`) — aba dentro da aba: mais clara ainda.
- **Nível 4** (`.fn-l4`) — e assim por diante.

### Como usar

```jsx
{/* Tela da funcionalidade "Relatórios" */}
<div className="screen fn-reports">

  {/* Bloco da funcionalidade (nível 1) */}
  <section className="fn-l1"> … </section>

  {/* Uma aba/subseção dentro de Relatórios (nível 2) */}
  <section className="fn-l2"> … </section>

  {/* Uma aba dentro dessa aba (nível 3) */}
  <section className="fn-l3"> … </section>

</div>
```

Utilitários extras:
- `.fn-ink` — texto na cor da funcionalidade.
- `.fn-tint` — fundo suave (cor da funcionalidade bem clara).

## Ao criar algo novo

1. Identifique a **funcionalidade-pai** (uma das 6 acima).
2. Aplique a classe `fn-<area>` no contêiner-raiz.
3. Use `.fn-l1`, `.fn-l2`, `.fn-l3`… conforme a profundidade do aninhamento.
4. Não invente cor nova: derive sempre da cor da funcionalidade-pai.

Os tokens vivem em `src/index.css` (bloco "SISTEMA DE CORES FUNCIONAIS").

## Padrão de contraste de aba — `src/lib/colors.js`

Mantém a legibilidade de qualquer aba/elemento colorido automaticamente:

- **`textOn(cor)`** → cor da **letra e do ícone**: `#000` se o fundo é claro, `#fff` se é escuro (luminância perceptual).
- **`darken(cor, amt)`** → versão mais escura da cor (ex.: faixa de "Resumo IA" no Kanban).
- **`frost(cor, alpha)`** → fundo **translúcido fosco** coerente com a aba.

Regras do padrão:
1. Use sempre **uma das 6 cores** funcionais como base da aba.
2. Letra e **ícones** na cor retornada por `textOn(base)` (ícone = cor da letra).
3. Elementos internos com **fundo translúcido fosco** (não cor sólida).
4. Sub-bloco mais escuro (ex.: faixa de resumo) usa `darken(base)` e recalcula o texto com `textOn(darken(base))`.

Exemplo (aplicado no Kanban):

```jsx
import { textOn, darken } from "../lib/colors.js"
const text = textOn(col.color)
const aiBg = darken(col.color, 0.42)
<div style={{ background: col.color, color: text }}>
  <Chevron style={{ color: text }} />
  <div style={{ background: aiBg, color: textOn(aiBg) }}>Resumo…</div>
</div>
```
