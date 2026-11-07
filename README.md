# Loja Online

Sistema completo de loja virtual feito com HTML, CSS e JavaScript puro, usando o **Firebase** (Firestore + Authentication) como banco de dados e login. Não precisa de servidor próprio nem de build: são só arquivos estáticos.

- **Loja** para o cliente: catálogo, carrinho, cupons, entrega/retirada, pedido e acompanhamento.
- **Painel administrativo** para o dono: dashboard, pedidos, produtos, categorias, fretes, cupons e configurações.
- **PWA**: a loja pode ser instalada no celular como aplicativo.

---

## Sumário

1. [Funcionalidades](#1-funcionalidades)
2. [Estrutura de arquivos](#2-estrutura-de-arquivos)
3. [Usando o painel administrativo](#3-usando-o-painel-administrativo)
4. [Como o cliente compra e acompanha](#4-como-o-cliente-compra-e-acompanha)
5. [Instalar como app (PWA)](#5-instalar-como-app-pwa)
6. [Limitações conhecidas](#6-limitações-conhecidas)
7. [Editar, salvar e publicar](#7-editar-salvar-e-publicar)

---

## 1. Funcionalidades

### Loja (`index.html`)
Tem duas páginas, trocadas pelo menu do topo (que rola na horizontal no celular):
- **Início**: banner com botão, **categorias** e **produtos em destaque** (os dois em **carrossel**, com setas, rolagem por toque e arrastar com o mouse), **localização** (endereço, horário, botão e mapa) e **contato** (WhatsApp, telefone, e-mail, Instagram e Facebook). Cada seção pode ser ligada ou desligada em Configurações.
- **Produtos**: página de catálogo com "← Voltar", título, **busca**, **menu lateral de categorias** (com subcategorias, que abrem pela seta ▾; no celular vira um botão "Categorias" que abre a lista), contagem de produtos e ordenação. Os cartões têm selo **Destaque** e de desconto, botão de **WhatsApp** (abre a conversa já perguntando pelo produto) e botão **Adicionar** contornado.
- **Botão flutuante do WhatsApp** no canto da tela, em todas as páginas.

Recursos:
- Catálogo com busca, filtro por categoria e ordenação (destaques, preço, nome).
- Selo de desconto (preço antigo × preço atual) e aviso de esgotado.
- Janela de detalhes do produto. Com **tamanhos e cores**, o cliente escolhe o tamanho, depois aparecem só as cores daquele tamanho (esgotadas riscadas) e a **foto muda para a cor escolhida**.
- Carrinho lateral salvo no navegador, respeitando o estoque de cada produto/variação.
- Compra em **3 etapas** dentro do carrinho, com indicador de progresso e botões Voltar/Continuar:
  1. **Produtos**: revisar itens e quantidades.
  2. **Entrega ou retirada**: nome, WhatsApp e, conforme a escolha, endereço (com busca de CEP pelo ViaCEP e região de frete) ou data e hora da retirada.
  3. **Pagamento**: PIX, cartão de crédito, cartão de débito ou dinheiro (com campo de troco), observações, cupom e resumo final.
- Cada etapa valida os campos antes de avançar, e dá para voltar (botão Voltar, "Alterar" ou clicando nas etapas já concluídas) sem perder o que foi preenchido.
- Cupons de desconto (percentual ou valor fixo, com pedido mínimo).
- Frete por região cadastrada no admin e **frete grátis** acima de um valor.
- Ao finalizar: o pedido é gravado, o cliente recebe um **código** e pode enviar o resumo pelo WhatsApp da loja.

### Acompanhamento (`acompanhar.html`)
- O cliente digita o código do pedido e vê o andamento em tempo real: recebido → confirmado → saiu para entrega / pronto para retirada → entregue.
- Pode imprimir ou salvar a página em PDF.

### Painel administrativo (`admin.html`)
- Login por e-mail e senha (Firebase Authentication) e "Esqueci minha senha".
- **Menu lateral**: no computador fica à esquerda com os nomes; no celular vira uma faixa estreita à esquerda só com ícones, e o botão ☰ no topo da faixa abre o menu completo (toque fora, em Esc ou em um item para fechar).
- **Dashboard**: receita total e do dia, número de pedidos, ticket médio, gráfico de vendas por dia (7/30/90 dias), mais vendidos e estoque baixo.
- **Pedidos**: lista com filtro por status, detalhes, mudança de status, impressão/PDF e botão para avisar o cliente pelo WhatsApp.
- **Produtos**: cadastro com foto (envio ou URL), preço, preço antigo, estoque, destaque, ocultar da loja e **tamanhos e cores** (com bolinha de cor, foto por cor e estoque de cada combinação).
- **Estoque**: painel com indicadores e gráficos, lista completa com ajustes (entrada, saída e correção), contagem de inventário, alerta de estoque mínimo e histórico de todas as movimentações, com exportação para **Excel**, **PDF** e CSV.
- **PDV (frente de caixa)**: venda no balcão com busca/código de barras, desconto, vários pagamentos na mesma venda (dinheiro com troco, PIX, débito, crédito e **a prazo** com parcelas que viram contas a receber), cadastro rápido de cliente e de produto sem sair da venda, cupom para imprimir, vendas do dia com cancelamento e **controle de caixa** (abertura, sangria, suprimento e fechamento com conferência).
- **Clientes**: cadastro com telefone, CPF/CNPJ, e-mail e endereço, e o quanto cada um tem em aberto.
- **Contas a pagar** e **contas a receber**, cada uma com sub-abas **Empresa** e **Pessoal**: vencimentos, baixa com data e valor, parcelas mensais, filtros, alertas de contas vencidas.
- **Relatórios**: indicadores com comparação ao período anterior e gráficos de fluxo de caixa, receita por origem, formas de pagamento, categorias, produtos, despesas, horários de maior venda e projeção de contas. Exporta CSV e imprime em PDF.
- **Categorias**, **Fretes** (valor por região), **Cupons** e **Configurações** (nome, cores, WhatsApp, endereço, horário, Instagram, frete padrão e frete grátis).
- **Impressora Bluetooth** e **avisos de pedido do site** (impressão automática e notificação).

---

## 2. Estrutura de arquivos

```
jtech-loja-online/
├── README.md               Este arquivo (não vai para o site)
├── firebase.json           Configuração do Firebase: qual pasta publicar, regras etc.
├── .firebaserc             Qual projeto Firebase usar (jtech-loja-online)
├── firestore.rules         Regras de segurança do banco (quem pode ler/gravar o quê)
└── public/                 ← SÓ esta pasta vai para o site
    ├── index.html              Loja (vitrine, carrinho, checkout)
    ├── acompanhar.html         Consulta do pedido pelo código
    ├── admin.html              Painel administrativo
    ├── firebase-config.js      Dados do projeto Firebase (precisa ser window.firebaseConfig)
    ├── manifest.webmanifest    Configuração do app instalável (PWA)
    ├── sw.js                   Service worker (PWA)
    ├── css/
    │   ├── style.css           Estilo da loja e da página de acompanhamento
    │   └── admin.css           Estilo do painel
    ├── js/
    │   ├── db.js               Camada de dados (Firestore/Auth) usada por todas as páginas
    │   ├── store.js            Lógica da loja
    │   ├── acompanhar.js       Lógica da página de acompanhamento
    │   ├── admin.js            Painel administrativo (login, dashboard, pedidos, produtos, fretes, cupons, config)
    │   ├── admin-grade.js      Editor de tamanhos e cores do produto (tabela de estoque e foto por cor)
    │   ├── admin-config.js     Configurações do site (aparência, página inicial, entrega, cadastro, pagamento, textos)
    │   ├── admin-estoque.js    Estoque: painel, ajustes, contagem, movimentações e exportação
    │   ├── admin-clientes.js   Cadastro de clientes (também usado pelo PDV)
    │   ├── admin-pdv.js        PDV: venda, vendas do dia e caixa
    │   ├── admin-financeiro.js Contas a pagar e a receber (Empresa/Pessoal)
    │   ├── admin-relatorios.js Relatórios e gráficos
    │   ├── pwa.js              Registro do service worker e botão "Instalar app"
    │   └── vendor/qrcode.js    Biblioteca de QR Code (qrcode-generator, licença MIT) usada pelo botão Site
    └── icons/                  Ícones do app
```

Todo acesso ao banco passa por `js/db.js`. Se um dia quiser trocar o Firebase por outro backend, é nesse arquivo que a mudança se concentra.

---

## 3. Usando o painel administrativo

### Pedidos
- Pedidos novos aparecem com um contador vermelho no menu. Quando chega um pedido pelo site com o painel aberto, o sistema **avisa na hora** (veja "Impressora e avisos de pedido" em Configurações).
- Clique em **Detalhes** para ver cliente, endereço/retirada, itens, frete e pagamento.
- Status possíveis: **Novo → Confirmado → Enviado → Entregue** (ou **Cancelado**). O cliente vê a mudança na página de acompanhamento.
- **Estoque:** é baixado quando você **confirma** o pedido e devolvido se ele voltar a "Novo" ou for cancelado. (Por segurança, o cliente não tem permissão de alterar produtos.)
- **Imprimir / PDF:** abre a versão para impressão; escolha "Salvar como PDF" no diálogo.
- **Avisar cliente:** abre o WhatsApp com uma mensagem do status escolhido e o link de acompanhamento.
- **Cupom na térmica:** imprime o pedido na impressora Bluetooth conectada.

### PDV
Menu **PDV**, com três sub-abas:

- **Venda**
  1. É preciso ter o **caixa aberto** (sub-aba Caixa). Sem ele, a tela da venda pede para abrir.
  2. Adicione produtos clicando neles, digitando na busca (nome, **SKU ou código de barras**) e apertando Enter, com um **leitor USB** (ele "digita" o código e dá Enter) ou com o botão **Câmera**. Produtos com variações pedem a opção.
     - **Botão Câmera** (ao lado da busca): abre a câmera do celular (ou do computador) em tela cheia, com uma mira. Cada código lido **adiciona o produto à venda** com um bipe e o leitor continua aberto para o próximo item. Se o código for de uma variação (ex.: tamanho M), adiciona aquela variação; se for de um produto com variações, abre a escolha da variação. Se o código **não estiver cadastrado**, aparece o atalho "Cadastrar produto com este código" (abre o cadastro rápido já preenchido). Há também um campo para digitar o código e o botão de **lanterna** (quando a câmera permite). Fecha com ✕ ou Esc.
     - A câmera usa o leitor do próprio navegador (Chrome/Edge no Android e no computador) e, onde ele não existe (Safari/iPhone, Firefox), baixa uma biblioteca de leitura (precisa de internet). Só funciona em **endereço seguro (https ou localhost)** e pede permissão de câmera.
     - O código é comparado sem diferenciar maiúsculas e minúsculas, e um EAN-13 que comece com 0 é reconhecido como o UPC-A de 12 dígitos.
  3. Ajuste quantidades, informe um **desconto** (R$ ou %) e o cliente (opcional).
  4. **Receber (F4)**: escolha a forma de pagamento e adicione; dá para combinar várias formas na mesma venda (ex.: parte em dinheiro, parte a prazo). A venda só conclui quando o total estiver coberto.
     - **Dinheiro**: informe o valor recebido do cliente e o **troco** aparece na hora.
     - **PIX, débito e crédito**: informe o valor (já vem preenchido com o restante).
     - **A prazo**: informe o valor, em **quantas parcelas** dividir, o **1º vencimento** e o intervalo (mensal, quinzenal ou semanal). Escolha o **cliente** (é obrigatório; dá para cadastrar um novo ali mesmo). Uma prévia mostra cada parcela com a data e o valor. Ao concluir, **cada parcela é lançada automaticamente em Contas a receber (Empresa)** no nome do cliente, com a categoria "Vendas a prazo".
  - **Cliente na venda**: digite no campo para buscar os cadastrados ou use o botão de **novo cliente** (ao lado do campo) para cadastrar na hora; ele já fica selecionado.
  - **Novo produto**: o botão acima da lista de produtos cadastra um produto na hora (nome, código, categoria, preço, custo e estoque inicial) e, se quiser, já o adiciona à venda. Foto, descrição e variações podem ser completadas depois em Produtos.
  5. Ao concluir, o estoque é baixado na hora e aparece o cupom, com botão **Imprimir cupom**. Com a impressora Bluetooth conectada, ele imprime direto nela (e sozinho, se a impressão automática do PDV estiver ligada); sem impressora, abre a janela de impressão do navegador (formato de 80 mm).
  - Atalhos: **F2** vai para a busca; **F4** abre o recebimento.
- **Vendas**: lista as vendas de um dia, reabre/reimprime o cupom e permite **cancelar** (devolve o estoque e remove as parcelas a prazo ainda não recebidas; se alguma parcela já tiver sido recebida, o sistema avisa para você ajustar em Contas a receber).
- **Caixa**: *abrir* com saldo inicial, registrar **sangria** (retirada) e **suprimento** (entrada), e *fechar* informando o dinheiro contado. O sistema mostra o dinheiro esperado (saldo inicial + vendas em dinheiro + suprimentos − sangrias) e a diferença. Os últimos fechamentos ficam listados.

### Clientes
- Menu **Clientes**: lista com busca por nome, telefone, CPF/CNPJ ou e-mail, botão de WhatsApp, edição e exclusão.
- **Novo cliente**: nome (obrigatório e único), telefone, CPF/CNPJ, e-mail, endereço e observações.
- A coluna **A receber (em aberto)** soma as contas a receber pendentes ligadas ao cliente (por exemplo, vendas a prazo do PDV).
- Excluir um cliente não apaga as contas dele; elas continuam com o nome, mas sem vínculo com o cadastro.

### Contas a pagar e contas a receber
- Dois itens de menu, cada um com as sub-abas **Empresa** e **Pessoal**.
- Cada aba mostra: total em aberto, vencidas, próximos 7 dias e quanto foi pago/recebido no mês.
- **Nova conta**: descrição, valor, vencimento, categoria (sugestões por tipo e por Empresa/Pessoal), fornecedor/cliente e observações. O campo **Repetir** cria parcelas mensais de uma vez (aluguel, financiamento etc.).
- **Pagar / Receber**: dá baixa informando a data e o valor efetivo (se houve juros, multa ou desconto). **Desfazer** devolve a conta para "em aberto".
- Situações: *Pendente*, *Vence hoje*, *Vencida* e *Pago/Recebido*. O menu mostra um contador vermelho com as contas a pagar vencidas.
- Filtros por situação, mês de vencimento e busca por texto.

### Relatórios
- Filtro único no topo: **período** (hoje, 7/30/90 dias, este mês, mês anterior, este ano ou personalizado) e **contas** consideradas no financeiro (Empresa, Pessoal ou ambas).
- **Indicadores** com variação em relação ao período anterior de mesma duração: receita, nº de vendas, ticket médio, lucro bruto estimado, entradas, saídas, saldo, lucro após despesas e saldos em aberto a pagar/receber.
- **Gráficos**: fluxo de caixa (entradas × saídas), receita por origem (PDV × loja online), formas de pagamento, receita por categoria, produtos mais vendidos, despesas por categoria, mapa de calor de horários de maior venda e projeção das contas das próximas 8 semanas. Todos têm tabela equivalente em **Ver tabela** e detalhes ao passar o mouse.
- **CSV vendas** (uma linha por item vendido) e **CSV contas**, em formato que o Excel brasileiro abre direto. **Imprimir / PDF** gera o relatório completo.
- Para o **lucro** aparecer, cadastre o **custo** de cada produto (campo em Produtos). Sem custo, o item não entra no cálculo e o relatório avisa a cobertura.
- As definições exatas de cada número estão em "Como os números são calculados", no fim da página.

### Produtos
- O botão **Adicionar exemplos** acrescenta o catálogo de acessórios de exemplo (veja o passo 3.7).
- Além dos campos básicos, há **SKU / código de barras** (usado na busca e na câmera do PDV; ao lado do campo há um botão de câmera para preenchê-lo lendo o código, e o sistema avisa se o código já pertence a outro produto), **estoque mínimo** e **custo** (usado no lucro dos relatórios).
- Cada **variação** pode ter o seu próprio **SKU / código de barras** (ex.: cada tamanho com um código diferente). No PDV, ler o código da variação adiciona exatamente aquela variação.
- Foto: envie um arquivo (é reduzida automaticamente para 600 px e guardada no próprio documento) ou cole uma URL de imagem.
- **Tamanhos e cores** (caixa no formulário do produto, código em `js/admin-grade.js`):
  1. **Tamanhos:** digite e aperte Enter, ou use um atalho (`P M G GG`, `PP ao XG`, `36 ao 46`, `Único`).
  2. **Cores:** *Adicionar cor* → nome, clique na bolinha para escolher a cor e no quadrado para enviar a **foto daquela cor** (sem foto, a loja usa a foto principal).
  3. **Estoque de cada combinação:** a tabela tamanho × cor se monta sozinha. **Vazio (—)** = você não vende aquela combinação (não aparece na loja). **0** = esgotada (aparece riscada).
  - Pode usar só tamanhos ou só cores. O estoque total é a soma da tabela. *Mostrar códigos* abre um SKU por combinação.
  - Para o resto do sistema (carrinho, pedido, PDV, estoque) cada combinação é uma variação com nome `M - Preta`.
  - Produtos antigos com variações digitadas (`M - Azul`) continuam funcionando; ao editar, o botão **Usar tamanhos e cores** troca para o formato novo (o estoque é preenchido de novo na tabela).
  - As fotos das cores ficam na coleção `fotosCores` do Firestore (um documento por produto, limite de ~900 KB de fotos por produto) e só são baixadas quando o cliente abre o produto.
- *Visível na loja* desmarcado oculta o produto sem excluí-lo.

### Estoque
Menu **Estoque**, com quatro sub-abas:

- **Painel**: indicadores (unidades, valor a custo e a preço de venda, lucro potencial, itens sem estoque, estoque baixo e estoque parado), situação do estoque, valor por categoria, gráfico de entradas × saídas dos últimos 30 dias, lista **"Precisam de reposição"** (com vendas dos últimos 30 dias, quantos dias o estoque dura e **sugestão de compra**), itens parados (sem venda em 30 dias) e as últimas movimentações.
- **Estoque**: todos os produtos, com as variações em linhas próprias. Filtros por busca/código, categoria e situação (sem estoque, baixo, normal), ordenação e "mostrar variações". Cada linha tem quatro botões:
  - **+ Entrada** (compra/reposição, devolução…): informa quantidade, custo unitário (e, se quiser, atualiza o custo do produto), motivo e observação.
  - **− Saída** (perda, brinde, uso interno…): não deixa tirar mais do que existe.
  - **✎ Ajustar**: define o estoque correto e o **estoque mínimo** do produto.
  - **Histórico**: abre as movimentações só daquele produto.
  - O **mínimo padrão** (usado por quem não tem mínimo próprio) é editado no topo da lista.
- **Contagem**: inventário. Digite a quantidade contada de cada item; a diferença aparece na hora e **só os itens diferentes** são ajustados ao clicar em "Aplicar contagem" (ficam no histórico como "Inventário"). Dá para baixar uma folha de contagem em CSV.
- **Movimentações**: histórico completo (data, produto, tipo, quantidade, estoque antes → depois, motivo e usuário), com filtro por período, tipo e busca. As **vendas do PDV, os pedidos do site confirmados, os cancelamentos e os estornos** entram sozinhos; também as alterações feitas no formulário do produto. O menu mostra um contador com os itens sem estoque ou abaixo do mínimo.

**Exportar a tabela de estoque** (botões na sub-aba "Estoque"; valem para o que está na tela, com os filtros aplicados):
- **Excel (.xlsx)**: planilha formatada com título, cabeçalho colorido e congelado, filtro automático, valores em R$, situação colorida (Normal, Baixo, Sem estoque) e linha de TOTAL, mais uma aba "Resumo". Colunas: Código, Produto, Variação, Categoria, Estoque, Mínimo, Custo unit., Preço de venda, Valor a custo, Valor de venda e Situação.
- **PDF / Imprimir**: a mesma tabela em página A4 deitada, com resumo no topo; na janela de impressão escolha "Salvar como PDF".
- **CSV**: a mesma tabela em texto simples.

### Categorias, fotos e subcategorias
- Cada categoria pode ter uma **foto** (envio de arquivo ou URL). Ela aparece no cartão redondo da categoria na página inicial; sem foto, é usado o ícone Font Awesome da categoria.
- Em **Categorias**, cada categoria pode ter uma **Categoria pai** (um nível de subcategorias, ex.: Masculino → Camisetas).
- Na loja, a categoria principal mostra também os produtos das subcategorias; as subcategorias aparecem ao abrir a seta ▾ no menu lateral da página de produtos. No cadastro de produto, a lista de categorias mostra as subcategorias com "↳".
- Excluir uma categoria principal transforma as subcategorias dela em categorias principais.

### Fretes
- Cadastre regiões (bairro, cidade ou zona) com **valor** e **prazo**.
- No checkout o cliente escolhe a região; ela é selecionada automaticamente quando o nome coincide com o bairro ou a cidade retornados pelo CEP.
- Sem nenhuma região ativa, vale o **frete padrão** de *Configurações*.
- O **frete grátis acima de** (em *Configurações*) vale para qualquer região.

### Cupons
- Código, tipo (percentual ou valor fixo), valor, pedido mínimo e ativo/inativo.

### Configurações do site
A aba **Configurações** controla o site de compra inteiro. No alto da tela há o botão **Site**, com três opções: **QR Code**, **Copiar link** e **Abrir site** (veja "Site: QR Code e link" mais abaixo). Ela tem 7 seções (abas no topo da tela); depois de mexer, clique em **Salvar configurações** e recarregue a loja para ver o resultado.

| Seção | O que dá para ajustar |
|---|---|
| **Loja e contato** | Nome, slogan, WhatsApp (DDI + DDD + número, só dígitos, ex.: `5573999998888`), telefone, e-mail, Instagram, Facebook, endereço, horário, se o mapa aparece e se o botão flutuante do WhatsApp aparece. |
| **Aparência** | 5 cores (principal, secundária, destaque, fundo e texto) com **pré-visualização ao vivo**, fonte (padrão, elegante ou arredondada), cantos (retos, suaves ou bem arredondados), **logo**, **banner** (envio de imagem ou endereço/URL), e título, texto e botão do banner. O texto sobre cada cor muda sozinho entre claro e escuro para continuar legível. |
| **Página inicial** | Ligar/desligar Categorias, Destaques, Localização e Contato; títulos de cada seção; quantidade de produtos em destaque; texto do contato. Também a **página de produtos**: título, frase acima do título e botão de WhatsApp nos cartões. |
| **Entrega e retirada** | Ativar entrega e/ou retirada (se só uma estiver ativa, o cliente nem precisa escolher); frete padrão, frete grátis a partir de um valor, **pedido mínimo**, aviso da entrega; na retirada: endereço, instruções, **dias da semana**, horário inicial e final, intervalo entre horários, antecedência mínima e prazo máximo de agendamento. Valores por bairro ficam na aba **Fretes**. |
| **Cadastro do cliente** | Para E-mail, CPF/CNPJ, CEP, Complemento e Observações: *não mostrar*, *opcional* ou *obrigatório*. Nome e WhatsApp são sempre obrigatórios, e o endereço é obrigatório nas entregas. O e-mail e o CPF informados aparecem no pedido, no painel. |
| **Pagamento** | Quais formas aceitar (PIX, crédito, débito, dinheiro), **chave PIX** (mostrada ao cliente com botão de copiar, na tela de pedido registrado e no WhatsApp) e aviso na etapa de pagamento. |
| **Textos** | Mensagem de pedido registrado, frase final da mensagem de WhatsApp e texto do rodapé. |

Validações ao salvar: pelo menos uma forma de receber e uma forma de pagamento ativas; WhatsApp com 10 a 15 dígitos; dias e horários de retirada coerentes.

Observações:
- O **banner** aparece logo depois do cabeçalho, mostrando **só a imagem**, na largura inteira e a partir do topo (sem título, texto, botão nem camada escura por cima). Imagens muito altas são cortadas só na parte de baixo (altura máxima de 640 px no computador). Sem imagem de banner, a loja mostra a faixa colorida com o título, o texto e o botão configurados.
- Logo e banner enviados do computador são reduzidos e guardados dentro do documento de configurações (limite do Firestore: 1 MB por documento). Para imagens grandes, é melhor colar o endereço (URL) de uma imagem hospedada.
- Ao abrir a loja aparece uma **tela de abertura** (também ao abrir **Acompanhar pedido**, tanto ao ir da loja para lá quanto ao voltar) neutra (fundo branco): a loja busca as configurações e carrega a **logo**, que aparece **em círculo**, com um anel girando em volta na **cor principal** cadastrada e só então mostra o site já com as cores certas, sem piscar o roxo padrão. O **rodapé** usa a cor principal da loja.
- O **painel administrativo** (tela de login e menu lateral) também usa a **cor principal** cadastrada em Configurações; a cor muda assim que você salva e fica guardada no aparelho para o login já abrir na cor certa.
- Ao ir da loja para o painel (login) aparece a mesma **tela de abertura com a logo**. Na tela de login há o botão **Baixar o app**: ele instala o painel como app (PWA próprio, `manifest-admin.webmanifest`), que **abre direto na tela de login**. O botão só aparece em navegadores que permitem instalar (Chrome/Edge/Android); no iPhone use Compartilhar > Adicionar à Tela de Início.
- **Clientes do site**: quem compra pelo site e ainda não está cadastrado entra sozinho na aba **Clientes** (nome, telefone, CPF, e-mail e endereço do pedido). A conferência é feita pelo painel ao entrar, quando chega pedido novo e ao abrir a aba Clientes; considera já cadastrado quem tem o mesmo telefone ou nome. Cliente excluído não volta sozinho.

#### Site: QR Code e link
Botão **Site** no alto da tela de Configurações (aparece em todas as abas):
- **QR Code**: abre uma janela com o QR Code da loja, o endereço embaixo e os botões **Baixar PNG** (imagem grande, boa para imprimir ou postar), **Imprimir** (página com o nome da loja, o QR Code e o endereço, para colar no balcão ou na vitrine) e **Copiar link**. O QR Code é gerado no próprio navegador e foi conferido com um leitor de QR Code.
- **Copiar link**: copia o endereço da loja e avisa "Link copiado".
- **Abrir site**: abre a loja em outra aba.

De onde vem o endereço: de **Loja e contato → Endereço (link) do site**. Se ficar em branco, usa o endereço da pasta em que o painel está aberto. **Importante:** se você abrir o painel por `localhost`/`127.0.0.1` (modo de teste), esse endereço só funciona no seu computador/rede; o QR Code mostra um aviso nesse caso. Informe o endereço público (ex.: `https://minhaloja.com.br`) para o QR Code funcionar para os clientes. O sistema acrescenta `https://` se faltar e recusa endereços inválidos.

#### Impressora e avisos de pedido (fim da tela de Configurações)
Este painel substitui o antigo "Conta e dados". A troca de senha continua disponível em "Esqueci minha senha", na tela de login.

- **Conectar impressora Bluetooth**: abre a lista de aparelhos do navegador; escolha a impressora. Depois use **Imprimir teste**. A conexão vale só para o navegador/aparelho em que foi feita (o navegador pode pedir para reconectar de vez em quando).
  - *Impressoras Bluetooth BLE* (baixa energia): botão "Conectar impressora Bluetooth", no Chrome/Edge do computador ou do Android.
  - *Impressoras Bluetooth clássicas* (as comuns de 58 mm): pareie primeiro no Windows e use "Conectar por porta serial" (Chrome/Edge do computador).
  - iPhone/iPad (Safari) não permitem conectar impressoras direto pelo navegador. Impressoras instaladas no sistema funcionam pelos botões "Imprimir / PDF".
- **Largura do papel**: 58 mm (32 colunas) ou 80 mm (48 colunas). O texto é enviado sem acentos, para funcionar em qualquer modelo.
- **Impressão automática**: duas caixas separadas, uma para **pedidos que chegam pelo site** e outra para **vendas concluídas no PDV**. Para imprimir sozinho, a impressora precisa estar conectada e o painel aberto.
- **Avisos de pedido do site**: com o painel aberto (pode ficar em segundo plano), cada pedido novo mostra um aviso na tela (com botões "Ver pedido" e imprimir), toca um som, pisca o título da aba e, se você ativar em "Ativar notificações do navegador", envia uma notificação do sistema. Há também "Testar aviso". Ao entrar no painel, ele informa quantos pedidos novos já estavam esperando.
- Cada opção desse painel é **salva na hora** (não precisa do botão "Salvar configurações"). As opções valem para a loja inteira; a conexão com a impressora é de cada navegador.
- Limite: os avisos só funcionam enquanto o painel está aberto. Com o painel fechado não há como avisar sem um servidor de notificações.

---

## 4. Como o cliente compra e acompanha

1. Navega pelo catálogo, escolhe tamanho e cor (ou a variação) quando houver e adiciona ao carrinho.
2. Abre o carrinho e segue as 3 etapas: **Produtos** → **Entrega ou retirada** (dados e endereço, ou data e hora) → **Pagamento** (forma de pagamento, cupom opcional e conferência do total). No fim, clica em **Finalizar pedido**.
3. Recebe uma tela com o **código do pedido** e dois botões: *Acompanhar pedido* e *Enviar pedido pelo WhatsApp*.
4. Em qualquer momento, acessa **Acompanhar pedido** (link no topo e no rodapé) e informa o código.

O pedido é salvo no Firebase mesmo que o cliente não envie a mensagem pelo WhatsApp.

---

## 5. Instalar como app (PWA)

- **Android / Chrome:** aparece o botão **Instalar app** no rodapé da loja (ou use o menu do Chrome → *Instalar app*).
- **iPhone / Safari:** botão Compartilhar → **Adicionar à Tela de Início**.
- Requer HTTPS (ou `localhost`).
- O app guarda em cache a estrutura da loja, mas **o catálogo precisa de internet**, pois vem do Firebase.
- O ícone do app (loja, acompanhar pedido e painel) é a imagem da pasta `icons/` (`icon-180`, `icon-192`, `icon-512` e `icon-maskable-512`, esta com margem de segurança para o recorte redondo do Android). Para trocar, substitua esses arquivos mantendo os nomes. A cor da barra do app instalado segue `theme-color`/`manifest.webmanifest`.

---

## 6. Limitações conhecidas

- Preços, cupons e frete são calculados no navegador (ver Segurança). Sempre confira o pedido antes de confirmar.
- Não há pagamento online integrado: o pagamento é combinado com o cliente (PIX, cartão na entrega etc.).
- O estoque só é baixado na confirmação do pedido, então dois clientes podem comprar a última unidade ao mesmo tempo antes de você confirmar. A loja revalida o estoque no momento de enviar o pedido para reduzir isso.
- Imagens ficam dentro do documento do produto (limite de 1 MB). Para muitas fotos grandes, considere o Firebase Storage.
- Um produto com variações tem um único preço para todas elas. Fotos diferentes só por **cor** (não por tamanho).
- O PDV, o caixa e o financeiro são **ferramentas de controle interno**: não emitem nota fiscal/cupom fiscal, não integram máquina de cartão e não conciliam com o banco. O cupom impresso é um comprovante simples.
- A impressão direta usa Web Bluetooth/Web Serial, que só existem no Chrome e no Edge, em endereço seguro (https ou localhost). Cada modelo de impressora térmica tem pequenas diferenças; se o teste sair errado, use a impressão pelo navegador.
- Os relatórios carregam as contas, produtos e as vendas do período a cada abertura. Para lojas com muito movimento, isso consome leituras do plano gratuito do Firebase (50 mil por dia); abra o relatório com períodos menores se necessário.
- O estoque do PDV é baixado imediatamente; o da loja online é baixado quando o pedido é confirmado.

---

## 7. Editar, salvar e publicar

Todo o projeto fica numa pasta só: `C:\Users\Jhemisonssz\Projetos\jtech\jtech-loja-online`. Não existe mais "cópia de deploy": você edita e publica a partir da mesma pasta.

**O ciclo de trabalho:**

1. Abra a pasta no VS Code e faça a mudança nos arquivos dentro de `public/`.
2. Teste no navegador (no VS Code: extensão *Live Server*, clicando com o botão direito em `public/index.html` → *Open with Live Server*).
3. **Salve no Git:** aba *Source Control* (ícone de ramificação) → escreva o que mudou (ex.: `corrige botão do carrinho`) → **Commit** → **Sync/Push**.
4. **Publique:** no terminal do VS Code, dentro da pasta do projeto:
   ```
   firebase deploy --project jtech-loja-online
   ```
   Isso envia a pasta `public/` para o site **e** as regras do `firestore.rules` para o banco.
   Só o site: `firebase deploy --project jtech-loja-online --only hosting`. Só as regras: `firebase deploy --project jtech-loja-online --only firestore:rules`.

   **Sempre use `--project jtech-loja-online`.** Sem ele, o Firebase pode usar um "projeto ativo" salvo em outra pasta e publicar no site errado.

**Regra de ouro:** só rode `firebase deploy` depois de fazer o commit. Assim, o que está no ar sempre tem uma versão salva no Git.

**Quem é administrador:** os e-mails ficam na função `emailsAdmin()` do `firestore.rules`. Para dar acesso a alguém: crie o usuário no Console do Firebase (*Authentication → Users → Add user*), coloque o e-mail na lista e rode `firebase deploy --project jtech-loja-online --only firestore:rules`.

**Mudou o `sw.js` ou algum arquivo da lista `BASE` dele?** Aumente o número em `const VERSAO = "loja-vNN"`, senão quem instalou o app pode continuar vendo a versão antiga.

**Site publicado:** https://jtech-loja-online.web.app — admin em https://jtech-loja-online.web.app/admin.html
