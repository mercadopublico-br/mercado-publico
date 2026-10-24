
/* Configuração do Supabase.
   Use apenas a chave pública neste arquivo do navegador. */
const SUPABASE_URL = "https://rhkomkjispjkgonwgfok.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable__OV759ub1rW49Mrakylsjg_4Y2Hfq2K";

if (!window.supabase) {
  console.error(
    "A biblioteca Supabase não carregou. Verifique sua conexão com a internet."
  );
} else {
  window.supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
  );

  var supabaseClient = window.supabaseClient;
}

const moedaBR = (valor) =>
  Number(valor || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });

async function carregarProdutos() {
  const lista = document.querySelector("#listaProdutos");

  if (!lista || !window.supabaseClient) return;

  const campoBusca = document.querySelector("#buscar");
  const semResultados = document.querySelector("#semResultados");
  const contador = document.querySelector("#contador");

  let categoriaAtiva = "";

  lista.textContent = "Carregando anúncios...";

  const { data, error } = await window.supabaseClient
    .from("produtos")
    .select(
      "id,nome,descricao,preco,categoria,condicao,cidade,imagem_url,criado_em"
    )
    .order("criado_em", { ascending: false });

  if (error) {
    console.error("Falha ao carregar anúncios:", error);

    lista.textContent =
      "Não foi possível carregar os anúncios. Verifique a conexão e as permissões do Supabase.";

    if (contador) contador.textContent = "";
    return;
  }

  const produtos = data || [];

  function renderizar() {
    const termo = (campoBusca?.value || "")
      .trim()
      .toLocaleLowerCase("pt-BR");

    const filtrados = produtos.filter((produto) => {
      const texto = [
        produto.nome,
        produto.descricao,
        produto.categoria,
        produto.cidade,
        produto.condicao
      ]
        .filter(Boolean)
        .join(" ")
        .toLocaleLowerCase("pt-BR");

      const correspondeTexto = texto.includes(termo);

      const correspondeCategoria =
        !categoriaAtiva ||
        (produto.categoria || "").toLocaleLowerCase("pt-BR") ===
          categoriaAtiva.toLocaleLowerCase("pt-BR");

      return correspondeTexto && correspondeCategoria;
    });

    lista.replaceChildren();

    if (contador) {
      contador.textContent =
        `${filtrados.length} anúncio${filtrados.length === 1 ? "" : "s"}`;
    }

    if (semResultados) {
      semResultados.classList.toggle("oculto", filtrados.length !== 0);
    }

    if (filtrados.length === 0) {
      lista.textContent = "Nenhum anúncio encontrado.";
      return;
    }

    for (const produto of filtrados) {
      const card = document.createElement("article");
      card.className = "produto";

      const foto = document.createElement("div");
      foto.className = "produto-imagem";

      if (
        produto.imagem_url &&
        /^https?:\/\//i.test(produto.imagem_url)
      ) {
        const img = document.createElement("img");
        img.src = produto.imagem_url;
        img.alt = `Foto de ${produto.nome || "produto"}`;
        img.loading = "lazy";
        img.referrerPolicy = "no-referrer";

        img.addEventListener("error", () => {
          foto.replaceChildren(document.createTextNode("📦"));
        });

        foto.appendChild(img);
      } else {
        foto.textContent = "📦";
      }

      const corpo = document.createElement("div");
      corpo.className = "produto-conteudo";

      const titulo = document.createElement("h3");
      titulo.textContent = produto.nome || "Produto sem nome";

      const local = document.createElement("p");
      local.textContent =
        [produto.categoria, produto.cidade].filter(Boolean).join(" · ") ||
        "Local não informado";

      const descricao = document.createElement("p");
      const textoDescricao = produto.descricao || "Sem descrição";

      descricao.textContent =
        textoDescricao.slice(0, 115) +
        (textoDescricao.length > 115 ? "…" : "");

      const preco = document.createElement("div");
      preco.className = "preco";
      preco.textContent = moedaBR(produto.preco);

      const link = document.createElement("a");
      link.className = "botao";
      link.href = `produto.html?id=${encodeURIComponent(produto.id)}`;
      link.textContent = "Ver produto";

      corpo.append(titulo, local, descricao, preco, link);
      card.append(foto, corpo);
      lista.appendChild(card);
    }
  }

  campoBusca?.addEventListener("input", renderizar);

  document.querySelectorAll("[data-categoria]").forEach((botao) => {
    botao.addEventListener("click", () => {
      categoriaAtiva = botao.dataset.categoria || "";

      document.querySelectorAll("[data-categoria]").forEach((outro) => {
        outro.classList.toggle("ativa", outro === botao);
      });

      renderizar();
    });
  });

  renderizar();
}

async function atualizarNavegacao() {
  if (!window.supabaseClient) return;

  const entrar = document.querySelector("#linkEntrar");
  const cadastro = document.querySelector("#linkCadastro");

  const { data, error } = await window.supabaseClient.auth.getSession();

  if (error) {
    console.error("Não foi possível verificar a sessão:", error.message);
    return;
  }

  if (data?.session) {
    if (entrar) {
      entrar.href = "#sair";
      entrar.textContent = "Sair";

      entrar.addEventListener("click", async (evento) => {
        evento.preventDefault();

        const { error: erroSaida } =
          await window.supabaseClient.auth.signOut();

        if (erroSaida) {
          console.error("Erro ao sair:", erroSaida.message);
          alert("Não foi possível sair da conta.");
          return;
        }

        window.location.reload();
      });
    }

    if (cadastro) {
      cadastro.href = "saldo.html";
      cadastro.textContent = "Minha conta";
    }
  }
}

function iniciarMarketplace() {
  carregarProdutos();
  atualizarNavegacao();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", iniciarMarketplace);
} else {
  iniciarMarketplace();
}
