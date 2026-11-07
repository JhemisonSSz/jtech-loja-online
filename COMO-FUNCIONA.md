# Como funciona a Loja Online

Este texto explica o **caminho dos dados**: o que acontece desde o momento em que você cadastra um produto até o estoque baixar depois de uma venda.

Para instalar, configurar e publicar, veja o [README.md](README.md).

```
 ADMIN                     LOJA (cliente)                    ADMIN
 ─────                     ──────────────                    ─────
 1. Cadastra o produto ──► 2. Vê o produto
                           3. Põe no carrinho
                           4. Fecha o pedido ──────────────► 5. Confirma o pedido
                              (WhatsApp + código)               │
                                                                ▼
                           6. Acompanha o status ◄────────── estoque baixa
```

---

## Peças principais

| Peça | O que é |
|---|---|
| **Firestore** | O banco de dados na nuvem, que é do Google (Firebase). Ele guarda tudo em "coleções", que funcionam como pastas cheias de fichas. |
| **`public/js/db.js`** | O **único** arquivo que conversa com o banco. Os outros arquivos pedem as coisas a ele, por exemplo `DB.produtos.listar()` ou `DB.pedidos.criar()`. |
| **`public/js/store.js`** | A loja que o cliente vê: a lista de produtos, a escolha de tamanho e cor, o carrinho e o fechamento do pedido. |
| **`public/js/admin.js`** + `admin-*.js` | O painel do dono da loja: produtos, pedidos, estoque, PDV etc. |
| **`firestore.rules`** | As **regras de segurança**, que dizem quem pode ler e quem pode gravar cada coleção. |

### Coleções do banco usadas neste caminho

| Coleção | Guarda | Quem lê | Quem grava |
|---|---|---|---|
| `produtos` | nome, preço, foto, estoque, tamanhos, cores e combinações | todos | só o admin |
| `fotosCores` | a foto de cada cor (uma ficha por produto) | todos | só o admin |
| `pedidos` | o pedido completo, com nome, telefone e endereço | só o admin | o cliente **cria**, o admin altera |
| `acompanhamento` | um resumo do pedido **sem dados pessoais** | qualquer pessoa que saiba o código | o cliente cria, o admin altera |
| `movimentos` | o histórico de cada entrada e saída de estoque | só o admin | só o admin |

---

## 1. O admin cadastra o produto

**Onde:** Admin → Produtos → "Novo produto" (`formProduto` em `admin.js`).

1. Você preenche o nome, o preço, a foto e a categoria.
2. Se o produto tem **tamanhos e cores**, a caixa "Tamanhos e cores" (`admin-grade.js`) monta uma tabela com uma linha por cor e uma coluna por tamanho:
   - **Célula vazia:** essa combinação não é vendida, então nem aparece na loja.
   - **0:** a combinação existe, mas está **esgotada** e aparece riscada.
   - **Número:** a quantidade em estoque.
3. Cada célula preenchida vira uma **variante**, que é a combinação de um tamanho com uma cor:
   ```js
   { id: "a1b2", nome: "M - Preta", tamanho: "M", cor: "c2", estoque: 4 }
   ```
   O nome `"M - Preta"` é o que aparece no carrinho, no pedido, no PDV e no estoque.
4. O **estoque total** do produto é a soma de todas as variantes.
5. Ao salvar:
   - `DB.produtos.salvar()` grava o produto em `produtos`.
   - `DB.fotosCores.salvar()` grava as fotos das cores **separadas**, em `fotosCores`. Elas ficam à parte porque cada ficha do Firestore tem limite de 1 MB e porque a loja baixa todos os produtos ao abrir; com as fotos junto, a loja ficaria lenta.
   - `DB.movimentos.registrar()` anota no histórico o "estoque inicial" (ou o "ajuste", se você editou um produto que já existia).

## 2. O cliente vê o produto

**Onde:** `store.js`, quando a página abre.

1. A loja busca tudo de uma vez: `DB.config.obter()`, `DB.produtos.listar()`, as categorias, os cupons e os fretes.
2. Ela mostra só os produtos com `ativo` diferente de `false`.
3. Quando o cliente abre um produto com tamanhos e cores (`renderEscolha`):
   - Ele escolhe o **tamanho**, e só então aparecem as **cores** que existem naquele tamanho.
   - Uma combinação com estoque 0 aparece **riscada** e não dá para clicar.
   - Ao escolher a cor, a foto muda para a foto dela. A foto vem de `fotosCores` e só é baixada nessa hora.
   - O botão só libera quando há tamanho e cor escolhidos, e aí mostra "Restam apenas N".

## 3. O cliente põe no carrinho

**Onde:** a função `adicionar` em `store.js`.

- O carrinho **não vai para o banco**. Ele fica guardado no próprio navegador do cliente (`localStorage`, na chave `lo_carrinho`).
- Cada item guarda só três coisas:
  ```js
  { id: "id-do-produto", vid: "id-da-variante", qtd: 2 }
  ```
  O preço e o nome **não** ficam guardados, porque são lidos de novo do produto sempre que precisa. Assim, se você mudar o preço no admin, o carrinho mostra o preço novo.
- `itensResolvidos()` confere o carrinho o tempo todo:
  - tira produtos desativados ou apagados;
  - tira variantes que não existem mais;
  - tira itens esgotados;
  - diminui a quantidade se ela passou do estoque.

## 4. O cliente fecha o pedido

**Onde:** o envio do formulário (`form.addEventListener("submit", ...)`) em `store.js`.

1. O cliente passa por 3 passos: carrinho → entrega → pagamento.
2. Antes de gravar, a loja **busca os produtos de novo** no banco. Se o estoque mudou nesse meio-tempo, ela avisa "Alguns itens mudaram de estoque" e volta para o carrinho.
3. Ela gera um **código** aleatório de 8 letras e números, por exemplo `K7QM2XPA`. Ele funciona como a "senha" do acompanhamento, por isso é difícil de adivinhar.
4. Ela monta o pedido com `status: "novo"` e `estoqueBaixado: false`. Cada item **copia** o nome, a variante e o preço daquele momento:
   ```js
   { id, vid, variante: "M - Preta", nome: "Bermuda Sarja", preco: 89.9, qtd: 1 }
   ```
   Ele copia porque o pedido precisa mostrar o que foi vendido **naquele dia**, mesmo que o produto mude depois.
5. `DB.pedidos.criar()` grava **duas fichas ao mesmo tempo** (um `batch`, ou seja, ou grava as duas ou nenhuma):
   - `pedidos/{código}`: o pedido completo, que só o admin lê;
   - `acompanhamento/{código}`: um resumo com o status, os itens, o total e **só o primeiro nome** do cliente.
6. A tela de sucesso mostra o código e um botão que abre o **WhatsApp** da loja com o pedido já escrito.
7. O carrinho é esvaziado.

> ⚠️ **O estoque ainda NÃO baixou.** Um pedido "novo" pode ser falso ou desistência. Ele só baixa quando você confirma (passo 5).

As regras do Firestore conferem que o cliente só consegue criar um pedido com status `novo`, com 1 a 50 itens e com um total numérico. Ele não consegue ler pedidos de outros clientes, nem alterar um pedido depois de criado.

## 5. O admin confirma, e o estoque baixa

**Onde:** Admin → Pedidos → Detalhes → Status (`mudarStatus` em `admin.js`).

Os status seguem esta ordem:

```
novo → confirmado → enviado → entregue
  └──────────── cancelado
```

| Mudança de status | O que acontece com o estoque |
|---|---|
| `novo` → `confirmado`, `enviado` ou `entregue` | **Baixa.** Cada item tira a sua quantidade da variante certa (por exemplo, da "M - Preta"), e o pedido passa a ter `estoqueBaixado: true`. |
| De um desses para `cancelado` ou de volta para `novo` | **Devolve** o que tinha baixado, e o pedido volta a ter `estoqueBaixado: false`. |
| Entre `confirmado`, `enviado` e `entregue` | Nada, porque já baixou. O `estoqueBaixado` impede que baixe duas vezes. |

A baixa é feita por `DB.produtos.ajustarEstoque()` (em `db.js`), que:
1. Abre uma **transação**: lê o produto e grava logo em seguida, sem que outra venda passe no meio.
2. Diminui o estoque da **variante** e recalcula o **total** do produto.
3. Nunca deixa o estoque ficar negativo, porque o menor valor possível é 0.
4. Grava uma linha em `movimentos`, como `"Pedido #K7QM2XPA confirmado"`, com o estoque de antes, o de depois e quem fez a mudança.

Depois, `DB.pedidos.atualizar()` grava o novo status em `pedidos` **e** em `acompanhamento`.

## 6. O cliente acompanha

**Onde:** `acompanhar.html` + `acompanhar.js`.

- O link vai com o código, por exemplo `acompanhar.html?c=K7QM2XPA`.
- `DB.acompanhar()` fica "escutando" a ficha `acompanhamento/{código}` (`onSnapshot`). Quando você muda o status no admin, a tela do cliente atualiza **sozinha**, sem recarregar.
- Ele vê só o resumo. O telefone e o endereço ficam em `pedidos`, que é privado.

---

## Outros caminhos que também mexem no estoque

Todos passam por `DB.produtos.ajustarEstoque()` ou `definirEstoque()`, e por isso todos aparecem no histórico (`movimentos`):

| De onde | Quando | Tipo no histórico |
|---|---|---|
| **PDV** (`admin-pdv.js`) | venda no balcão: baixa **na hora** | `venda_pdv` |
| **PDV** | cancelamento de uma venda: devolve | `cancelamento_pdv` |
| **Estoque** (`admin-estoque.js`) | entrada de mercadoria, saída, ajuste ou contagem de estoque | `entrada`, `saida`, `ajuste`, `inventario` |
| **Formulário do produto** | você muda o número direto na edição | `ajuste` |

## Limitações que vale saber

- **O estoque não fica reservado** enquanto o pedido está "novo". Se dois clientes comprarem a última peça, os dois pedidos entram, e a baixa fica em 0 (nunca negativa). Você resolve na hora de confirmar.
- **O carrinho fica no navegador.** Se o cliente trocar de celular, o carrinho não vai junto.
- **O preço do pedido vem do navegador do cliente.** As regras não conferem o total com o preço real do produto. Por isso, **confira o valor** antes de confirmar um pedido.
