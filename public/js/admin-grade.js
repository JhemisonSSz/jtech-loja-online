// Editor de "Tamanhos e cores" do formulário de produto (painel admin).
//
// Como funciona:
//   1. o admin informa os TAMANHOS (digitando ou por atalho: "P M G GG"...);
//   2. informa as CORES (nome, cor da bolinha e uma foto para cada cor);
//   3. a TABELA de estoque tamanho × cor se monta sozinha.
//      Célula vazia (—) = essa combinação não é vendida (não aparece na loja).
//      Célula 0 = combinação esgotada (aparece riscada na loja).
//
// Cada célula preenchida vira uma "variante" do produto, com nome "M - Preta".
// O resto do sistema (carrinho, PDV, estoque) só enxerga essas variantes, como antes.
// Usado em admin.js → formProduto(). Os dados são gravados por js/db.js.
(function () {
  const ATALHOS = [
    ["P M G GG", ["P", "M", "G", "GG"]],
    ["PP ao XG", ["PP", "P", "M", "G", "GG", "XG"]],
    ["36 ao 46", ["36", "38", "40", "42", "44", "46"]],
    ["Único", ["Único"]],
  ];
  const LIMITE_FOTOS = 900000; // um documento do Firestore aceita até ~1 MB
  const novoId = (prefixo) => prefixo + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
  const hexValido = (h) => (/^#[0-9a-f]{6}$/i.test(h || "") ? h : "#cccccc");
  const chave = (tamanho, idCor) => (tamanho || "") + "|" + (idCor || "");

  // container: onde o editor é desenhado
  // produto: produto que está sendo editado (pode já ter tamanhos, cores e variantes)
  // fotosIniciais: { idDaCor: imagem } vindas de DB.fotosCores.obter()
  // opcoes: { lerImagem(arquivo), toast(msg), aoMudarTotal(total, temVariantes) }
  function montar(container, produto, fotosIniciais, opcoes) {
    const { esc, nomeVariante } = DB;
    const { lerImagem, toast, aoMudarTotal } = opcoes;

    // ---- Estado do editor ----
    const tamanhos = [...(produto.tamanhos || [])];
    const cores = (produto.cores || []).map((c) => ({ ...c }));
    const fotos = { ...fotosIniciais };
    // células preenchidas: "tamanho|idCor" → { id, estoque, codigo }
    const celulas = {};
    if (DB.ehGrade(produto)) {
      (produto.variantes || []).forEach((v) => { celulas[chave(v.tamanho, v.cor)] = { id: v.id, estoque: v.estoque || 0, codigo: v.codigo || "" }; });
    }
    let mostrarCodigos = Object.values(celulas).some((c) => c.codigo);

    // Sem cores, a tabela tem uma linha só; sem tamanhos, uma coluna só.
    const linhas = () => (cores.length ? cores : [null]);
    const colunas = () => (tamanhos.length ? tamanhos : [""]);
    const temGrade = () => tamanhos.length > 0 || cores.length > 0;
    const celulasAtuais = () => {
      if (!temGrade()) return [];
      const lista = [];
      linhas().forEach((c) => colunas().forEach((t) => {
        const cel = celulas[chave(t, c && c.id)];
        if (cel) lista.push({ t, c, cel });
      }));
      return lista;
    };

    const atualizarTotal = () => {
      const atuais = celulasAtuais();
      const total = atuais.reduce((s, x) => s + x.cel.estoque, 0);
      const el = container.querySelector(".gc-total");
      if (el) el.textContent = total;
      aoMudarTotal(total, atuais.length > 0);
    };

    // ---- Desenho ----
    const htmlTabela = () => `
      <div class="grade-passo">
        <div class="vars-cab"><b><span class="grade-num">3</span> Estoque de cada combinação</b>
          <label class="grade-mostrar"><input type="checkbox" class="gc-mostrar-cod" ${mostrarCodigos ? "checked" : ""} /> mostrar códigos</label></div>
        <div class="grade-tabela-wrap"><table class="grade-tabela">
          <thead><tr><th></th>${colunas().map((t) => `<th>${esc(t || "Estoque")}</th>`).join("")}</tr></thead>
          <tbody>${linhas().map((c) => `<tr>
            <th data-cab-cor="${c ? esc(c.id) : ""}">${c ? esc(c.nome || "(sem nome)") : "Estoque"}</th>
            ${colunas().map((t) => {
              const k = chave(t, c && c.id), cel = celulas[k];
              const rotulo = nomeVariante(t, c && c.nome) || "estoque";
              return `<td>
                <input type="number" min="0" step="1" class="gc-est" data-k="${esc(k)}" placeholder="—" value="${cel ? cel.estoque : ""}" aria-label="Estoque ${esc(rotulo)}" />
                ${mostrarCodigos ? `<input class="gc-cod" data-k="${esc(k)}" placeholder="SKU" value="${esc(cel ? cel.codigo : "")}" ${cel ? "" : "disabled"} autocomplete="off" aria-label="Código ${esc(rotulo)}" />` : ""}
              </td>`;
            }).join("")}
          </tr>`).join("")}</tbody>
        </table></div>
        <p class="dica"><b>Vazio (—)</b> = você não vende essa combinação (não aparece na loja). <b>0</b> = esgotada (aparece riscada).</p>
        <p class="grade-total">Estoque total: <b class="gc-total">0</b></p>
      </div>`;

    const desenhar = () => {
      container.innerHTML = `
        <div class="grade-passo">
          <b><span class="grade-num">1</span> Tamanhos</b>
          <div class="grade-chips">
            ${tamanhos.map((t, i) => `<span class="grade-chip">${esc(t)}<button type="button" data-rem-tam="${i}" aria-label="Remover tamanho ${esc(t)}">&times;</button></span>`).join("")}
            <input class="grade-novo-tam" placeholder="+ tamanho" maxlength="12" aria-label="Novo tamanho" />
          </div>
          <p class="dica">Digite e aperte Enter. Atalhos: ${ATALHOS.map(([nome], i) => `<button type="button" class="grade-link" data-atalho="${i}">${nome}</button>`).join(" · ")}</p>
        </div>
        <div class="grade-passo">
          <div class="vars-cab"><b><span class="grade-num">2</span> Cores</b>
            <button type="button" class="btn sec peq" data-add-cor><i class="fa-solid fa-plus"></i> Adicionar cor</button></div>
          ${cores.map((c, i) => `<div class="grade-cor">
            <input type="color" class="gc-hex" data-i="${i}" value="${hexValido(c.hex)}" aria-label="Cor da bolinha" />
            <input class="gc-nome" data-i="${i}" placeholder="Nome da cor (ex.: Preta)" value="${esc(c.nome)}" />
            <label class="gc-foto" title="Foto desta cor">
              ${fotos[c.id] ? `<img src="${esc(fotos[c.id])}" alt="Foto da cor ${esc(c.nome)}" />` : `<i class="fa-solid fa-camera"></i>`}
              <input type="file" accept="image/*" class="gc-arquivo" data-i="${i}" hidden />
            </label>
            ${fotos[c.id] ? `<button type="button" class="grade-link" data-tirar-foto="${i}">tirar foto</button>` : "<span></span>"}
            <button type="button" class="rem-var" data-rem-cor="${i}" aria-label="Remover cor ${esc(c.nome)}">&times;</button>
          </div>`).join("")}
          <p class="dica">Clique na bolinha para escolher a cor e no quadrado para enviar a foto dela. Sem foto, a loja mostra a foto principal do produto.</p>
        </div>
        ${temGrade() ? htmlTabela() : `<p class="dica">Sem tamanhos e sem cores, o produto usa o campo "Estoque" acima.</p>`}`;
      atualizarTotal();
    };

    const adicionarTamanhos = (lista) => {
      lista.map((t) => t.trim()).filter(Boolean).forEach((t) => {
        if (!tamanhos.some((x) => x.toLowerCase() === t.toLowerCase())) tamanhos.push(t);
      });
      desenhar();
      container.querySelector(".grade-novo-tam").focus();
    };

    // ---- Eventos (um ouvinte só no container, para todos os botões e campos) ----
    container.addEventListener("click", (e) => {
      const b = e.target.closest("button");
      if (!b) return;
      if (b.dataset.remTam !== undefined) { tamanhos.splice(+b.dataset.remTam, 1); desenhar(); }
      else if (b.dataset.atalho !== undefined) adicionarTamanhos(ATALHOS[+b.dataset.atalho][1]);
      else if (b.hasAttribute("data-add-cor")) {
        cores.push({ id: novoId("c"), nome: "", hex: "#cccccc" });
        desenhar();
        const nomes = container.querySelectorAll(".gc-nome");
        nomes[nomes.length - 1].focus();
      } else if (b.dataset.remCor !== undefined) {
        const c = cores[+b.dataset.remCor];
        if (c.nome && !confirm(`Remover a cor "${c.nome}"? O estoque dela some da tabela.`)) return;
        delete fotos[c.id];
        cores.splice(+b.dataset.remCor, 1);
        desenhar();
      } else if (b.dataset.tirarFoto !== undefined) { delete fotos[cores[+b.dataset.tirarFoto].id]; desenhar(); }
    });

    container.addEventListener("keydown", (e) => {
      // Enter no campo de tamanho adiciona o tamanho (e não envia o formulário)
      if (e.target.matches(".grade-novo-tam") && (e.key === "Enter" || e.key === ",")) {
        e.preventDefault();
        adicionarTamanhos([e.target.value]);
      }
    });

    container.addEventListener("input", (e) => {
      const el = e.target;
      if (el.matches(".gc-nome")) {
        const c = cores[+el.dataset.i];
        c.nome = el.value;
        const cab = container.querySelector(`[data-cab-cor="${CSS.escape(c.id)}"]`);
        if (cab) cab.textContent = c.nome.trim() || "(sem nome)";
      } else if (el.matches(".gc-hex")) cores[+el.dataset.i].hex = el.value;
      else if (el.matches(".gc-est")) {
        const k = el.dataset.k;
        if (el.value === "") delete celulas[k];
        else {
          const estoque = Math.max(0, parseInt(el.value, 10) || 0);
          celulas[k] = celulas[k] ? { ...celulas[k], estoque } : { id: novoId("v"), estoque, codigo: "" };
        }
        const cod = el.parentElement.querySelector(".gc-cod");
        if (cod) cod.disabled = !celulas[k];
        atualizarTotal();
      } else if (el.matches(".gc-cod") && celulas[el.dataset.k]) celulas[el.dataset.k].codigo = el.value;
    });

    container.addEventListener("change", async (e) => {
      const el = e.target;
      if (el.matches(".grade-novo-tam") && el.value.trim()) adicionarTamanhos([el.value]);
      else if (el.matches(".gc-mostrar-cod")) { mostrarCodigos = el.checked; desenhar(); }
      else if (el.matches(".gc-arquivo") && el.files[0]) {
        try { fotos[cores[+el.dataset.i].id] = await lerImagem(el.files[0]); desenhar(); }
        catch { toast("Arquivo de imagem inválido"); }
      }
    });

    desenhar();

    return {
      // Devolve { tamanhos, cores, variantes, fotos } prontos para salvar, ou { erro: "mensagem" }
      ler() {
        if (cores.some((c) => !c.nome.trim())) return { erro: "Dê um nome para todas as cores" };
        const nomesCores = cores.map((c) => c.nome.trim().toLowerCase());
        if (new Set(nomesCores).size !== nomesCores.length) return { erro: "Há cores com o mesmo nome" };
        const variantes = celulasAtuais().map(({ t, c, cel }) => ({
          id: cel.id, nome: nomeVariante(t, c && c.nome.trim()), tamanho: t, cor: c ? c.id : "", codigo: cel.codigo.trim(), estoque: cel.estoque,
        }));
        if (temGrade() && !variantes.length) return { erro: "Preencha o estoque de pelo menos uma combinação (use 0 se estiver esgotada)" };
        const fotosUsadas = {};
        cores.forEach((c) => { if (fotos[c.id]) fotosUsadas[c.id] = fotos[c.id]; });
        if (JSON.stringify(fotosUsadas).length > LIMITE_FOTOS) return { erro: "As fotos das cores passaram do limite (cerca de 900 KB no total). Use menos fotos ou imagens menores." };
        return {
          tamanhos: [...tamanhos],
          cores: cores.map((c) => ({ id: c.id, nome: c.nome.trim(), hex: hexValido(c.hex) })),
          variantes,
          fotos: fotosUsadas,
        };
      },
    };
  }

  window.AdminGrade = { montar };
})();
