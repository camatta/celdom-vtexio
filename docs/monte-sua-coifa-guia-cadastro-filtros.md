# Guia Prático: Cadastro do Quiz "Monte Sua Coifa"

## Objetivo

Este guia explica como preencher o quiz no Site Editor para que as perguntas, respostas e cores levem o cliente apenas para produtos válidos.

## Lógica do quiz

- Cada **pergunta** usa um **ID do atributo no catálogo do produto pai**.
- Cada **resposta** usa o **valor desse atributo**.
- A cada resposta, o quiz refaz a filtragem e atualiza a próxima etapa.
- Por isso, a etapa seguinte só mostra opções que ainda têm produtos compatíveis.
- No final, o resultado exibe apenas os produtos que atendem ao conjunto das escolhas.

## Regra principal

O campo **Valor do atributo no catálogo do produto pai** precisa ser exatamente igual ao valor cadastrado no produto.

Exemplo:

- Produto: `Box`
- Site Editor: `Box` -> funciona
- Site Editor: `box` -> pode não funcionar

---

## Preenchimento no Site Editor

## 1. Perguntas

Em cada pergunta, preencher:

- **Pergunta (título)**
- **Texto de apoio**
- **ID do atributo no catálogo do produto pai para esta pergunta**

## 2. Respostas

Em cada resposta da pergunta, preencher:

- **Nome da opção (texto exibido)**
- **Valor do atributo no catálogo do produto pai**
- **Imagem da opção**

## 3. Como o filtro funciona

- Se a resposta tiver **Valor do atributo no catálogo do produto pai**, ela participa da filtragem.
- Se a resposta estiver sem valor, ela não aplica filtro direto.
- Isso é útil em casos como `Colorido`, em que o filtro real vem da cor escolhida depois.

---

## Preenchimento do Seletor de Cores

No bloco **Seletor de cores (opcional)**, preencher:

- **Ativar seletor de cor**
- **ID do atributo no catálogo do produto pai para as cores**
- **Texto acima das cores**
- **Texto de ajuda (quando nenhuma cor foi escolhida)**

Em cada cor, preencher:

- **Nome da cor**
- **Cor (HEX)**
- **Valor do atributo no catálogo do produto pai (cor)**

---

## Validação no catálogo VTEX

Antes de publicar, conferir:

- O atributo existe no catálogo do produto pai.
- O ID do atributo está correto.
- Os produtos pai estão com o atributo preenchido.
- O valor da resposta ou da cor bate com o valor cadastrado no produto.

---

## Fluxo recomendado

1. Definir a pergunta e o ID do atributo do produto pai.
2. Definir as respostas com os valores do atributo.
3. Salvar no Site Editor.
4. Testar se a próxima etapa mostra apenas opções válidas.
5. Concluir o fluxo e validar os produtos finais.

---

## Checklist rápido

- [ ] Preenchi **ID do atributo no catálogo do produto pai para esta pergunta**
- [ ] Preenchi **Valor do atributo no catálogo do produto pai** nas respostas
- [ ] Preenchi imagens das opções
- [ ] (Se usar cor) preenchi **ID do atributo no catálogo do produto pai para as cores**
- [ ] (Se usar cor) preenchi **Valor do atributo no catálogo do produto pai (cor)**
- [ ] Testei a progressão entre as etapas
- [ ] Testei o resultado final do quiz

---

## Se não aparecer produto

Verificar:

- ID do atributo da pergunta
- valor da resposta ou da cor
- cadastro do produto pai
- tempo de atualização da busca no catálogo
- se existe algum produto que atenda ao conjunto das respostas dadas

