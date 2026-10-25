import { useEffect, useMemo, useState } from 'react';
import { supabase } from './lib/supabase';
import {
  Search,
  Heart,
  Plus,
  ArrowRight,
  ShieldCheck,
  Zap,
  Gamepad2,
  Smartphone,
  Car,
  House,
  Shirt,
  Dumbbell,
  Laptop,
  Package,
  MapPin,
  SlidersHorizontal,
  Sparkles,
  MessageCircle,
  Menu,
  TrendingUp,
  CircleUserRound,
  X,
  Info,
} from 'lucide-react';

const CATEGORIES = [
  { name: 'Eletrônicos', icon: Laptop, color: '#a78bfa' },
  { name: 'Celulares', icon: Smartphone, color: '#67e8f9' },
  { name: 'Games', icon: Gamepad2, color: '#f0abfc' },
  { name: 'Veículos', icon: Car, color: '#fca5a5' },
  { name: 'Casa', icon: House, color: '#86efac' },
  { name: 'Moda', icon: Shirt, color: '#fcd34d' },
  { name: 'Esportes', icon: Dumbbell, color: '#fdba74' },
  { name: 'Outros', icon: Package, color: '#c4b5fd' },
];

// Dados temporários de demonstração.
// Depois, os anúncios serão carregados do Supabase.
const DEMO_PRODUCTS = [
  {
    id: 'demo-1',
    name: 'Notebook para trabalho e estudos',
    category: 'Eletrônicos',
    price: 2499.9,
    location: 'Maceió, AL',
    condition: 'Seminovo',
    emoji: '💻',
    color: '#272044',
    featured: true,
  },
  {
    id: 'demo-2',
    name: 'Smartphone com excelente câmera',
    category: 'Celulares',
    price: 1399,
    location: 'Maceió, AL',
    condition: 'Usado',
    emoji: '📱',
    color: '#183b45',
    featured: true,
  },
  {
    id: 'demo-3',
    name: 'Console de videogame',
    category: 'Games',
    price: 2199,
    location: 'Arapiraca, AL',
    condition: 'Seminovo',
    emoji: '🎮',
    color: '#412345',
    featured: false,
  },
  {
    id: 'demo-4',
    name: 'Bicicleta para passeios',
    category: 'Esportes',
    price: 650,
    location: 'Maceió, AL',
    condition: 'Usado',
    emoji: '🚲',
    color: '#3b3321',
    featured: false,
  },
  {
    id: 'demo-5',
    name: 'Cadeira para escritório',
    category: 'Casa',
    price: 480,
    location: 'Rio Largo, AL',
    condition: 'Seminovo',
    emoji: '🪑',
    color: '#234035',
    featured: false,
  },
  {
    id: 'demo-6',
    name: 'Fone Bluetooth sem fio',
    category: 'Eletrônicos',
    price: 189.9,
    location: 'Maceió, AL',
    condition: 'Novo',
    emoji: '🎧',
    color: '#29334b',
    featured: true,
  },
  {
    id: 'demo-7',
    name: 'Tênis casual para o dia a dia',
    category: 'Moda',
    price: 220,
    location: 'Maceió, AL',
    condition: 'Novo',
    emoji: '👟',
    color: '#45332c',
    featured: false,
  },
  {
    id: 'demo-8',
    name: 'Acessório para setup gamer',
    category: 'Games',
    price: 159.9,
    location: 'Maceió, AL',
    condition: 'Novo',
    emoji: '⌨️',
    color: '#263d42',
    featured: false,
  },
];

const formatPrice = (price) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(price);

export default function App() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Todas');
  const [favorites, setFavorites] = useState([]);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [notice, setNotice] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [authMode, setAuthMode] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    if (!supabase) return undefined;

    let mounted = true;

    supabase.auth.getSession().then(({ data, error }) => {
      if (!mounted) return;

      if (error) {
        setAuthError(error.message);
        return;
      }

      setUser(data.session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) setUser(session?.user ?? null);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function handleAuthSubmit(event) {
    event.preventDefault();
    setAuthError('');

    if (!supabase) {
      setAuthError(
        'A conexão com o Supabase não foi carregada. Confira as configurações do projeto.'
      );
      return;
    }

    if (!email.trim() || !password) {
      setAuthError('Preencha o e-mail e a senha.');
      return;
    }

    setAuthLoading(true);

    try {
      if (authMode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        });

        if (error) throw error;

        if (data.session) {
          setUser(data.session.user);
          setAuthMode(null);
          setEmail('');
          setPassword('');
          showNotice('Conta criada com sucesso!');
        } else {
          setAuthMode('login');
          setPassword('');
          showNotice(
            'Cadastro iniciado! Confira seu e-mail para confirmar a conta.'
          );
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) throw error;

        setUser(data.user);
        setAuthMode(null);
        setEmail('');
        setPassword('');
        showNotice('Você entrou na sua conta!');
      }
    } catch (error) {
      setAuthError(
        error.message || 'Não foi possível concluir a operação.'
      );
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleSignOut() {
    if (!supabase) return;

    const { error } = await supabase.auth.signOut();

    if (error) {
      showNotice('Não foi possível sair da conta. Tente novamente.');
      return;
    }

    setUser(null);
    showNotice('Você saiu da sua conta.');
  }

  function showNotice(message) {
    setNotice(message);
  }

  function openSection(section) {
    setMenuOpen(false);

    if (section === 'login') {
      setAuthError('');
      setAuthMode('login');
      return;
    }

    if (section === 'publish') {
      if (!user) {
        setAuthError('');
        setAuthMode('signup');
        showNotice('Crie uma conta ou entre para anunciar produtos.');
        return;
      }

      showNotice(
        'Sua conta está conectada. A publicação de anúncios ainda precisa ser implementada.'
      );
      return;
    }

    showNotice(`${section} estará disponível em uma próxima etapa.`);
  }

  const filteredProducts = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return DEMO_PRODUCTS.filter((product) => {
      const matchesSearch =
        !normalizedSearch ||
        product.name.toLowerCase().includes(normalizedSearch) ||
        product.category.toLowerCase().includes(normalizedSearch) ||
        product.location.toLowerCase().includes(normalizedSearch);

      const matchesCategory =
        category === 'Todas' || product.category === category;

      const matchesFavorites =
        !favoritesOnly || favorites.includes(product.id);

      return matchesSearch && matchesCategory && matchesFavorites;
    });
  }, [search, category, favorites, favoritesOnly]);

  function toggleFavorite(productId) {
    setFavorites((current) =>
      current.includes(productId)
        ? current.filter((id) => id !== productId)
        : [...current, productId]
    );
  }

  const featuredProducts = filteredProducts.filter(
    (product) => product.featured
  );
    return (
    <div className="min-h-screen bg-[#0b0b0f] text-white">
      {/* CABEÇALHO */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0b0b0f]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 md:px-8">
          <button
            onClick={() => {
              setCategory('Todas');
              setFavoritesOnly(false);
              setSearch('');
              setMenuOpen(false);
            }}
            className="flex items-center gap-2 text-left"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 text-xl font-black">
              M
            </span>
            <span className="text-xl font-black tracking-tight">
              Mercado <span className="text-violet-400">Público</span>
            </span>
          </button>

          <div className="hidden max-w-xl flex-1 md:block">
            <div className="flex items-center rounded-xl border border-white/10 bg-white/[0.04] px-4 focus-within:border-violet-500">
              <Search size={19} className="text-gray-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar produtos, categorias ou cidade..."
                className="w-full bg-transparent px-3 py-3 text-sm outline-none placeholder:text-gray-500"
              />
              {search && (
                <button onClick={() => setSearch('')} aria-label="Limpar busca">
                  <X size={17} className="text-gray-400" />
                </button>
              )}
            </div>
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <button
              onClick={() => setFavoritesOnly((value) => !value)}
              className={`rounded-xl p-3 transition ${
                favoritesOnly
                  ? 'bg-pink-500/15 text-pink-400'
                  : 'text-gray-300 hover:bg-white/5'
              }`}
              title="Favoritos"
            >
              <Heart size={20} />
            </button>

            {user ? (
              <button
                onClick={handleSignOut}
                className="rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold hover:bg-white/5"
              >
                Sair
              </button>
            ) : (
              <button
                onClick={() => openSection('login')}
                className="rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold hover:bg-white/5"
              >
                Entrar
              </button>
            )}

            <button
              onClick={() => openSection('publish')}
              className="flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-bold transition hover:bg-violet-500"
            >
              <Plus size={18} />
              Anunciar
            </button>
          </div>

          <button
            onClick={() => setMenuOpen((value) => !value)}
            className="rounded-xl border border-white/10 p-2 md:hidden"
            aria-label="Abrir menu"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* BUSCA E MENU PARA CELULAR */}
        <div className="px-4 pb-4 md:hidden">
          <div className="flex items-center rounded-xl border border-white/10 bg-white/[0.04] px-3">
            <Search size={18} className="text-gray-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar produtos ou cidade..."
              className="w-full bg-transparent px-3 py-3 text-sm outline-none placeholder:text-gray-500"
            />
          </div>

          {menuOpen && (
            <div className="mt-3 grid grid-cols-2 gap-2 rounded-xl border border-white/10 bg-[#14141b] p-3">
              {user ? (
                <button
                  onClick={handleSignOut}
                  className="rounded-lg border border-white/10 px-3 py-3 text-sm"
                >
                  Sair da conta
                </button>
              ) : (
                <button
                  onClick={() => openSection('login')}
                  className="rounded-lg border border-white/10 px-3 py-3 text-sm"
                >
                  Entrar
                </button>
              )}

              <button
                onClick={() => openSection('publish')}
                className="rounded-lg bg-violet-600 px-3 py-3 text-sm font-bold"
              >
                <Plus size={16} className="mr-1 inline" />
                Anunciar
              </button>

              <button
                onClick={() => {
                  setFavoritesOnly((value) => !value);
                  setMenuOpen(false);
                }}
                className="rounded-lg border border-white/10 px-3 py-3 text-sm"
              >
                <Heart size={16} className="mr-1 inline" />
                Favoritos
              </button>

              <button
                onClick={() => openSection('Área do vendedor')}
                className="rounded-lg border border-white/10 px-3 py-3 text-sm"
              >
                Área do vendedor
              </button>

              <button
                onClick={() => openSection('Área motoboy')}
                className="rounded-lg border border-white/10 px-3 py-3 text-sm"
              >
                Área motoboy
              </button>
            </div>
          )}
        </div>
      </header>

      {/* AVISO */}
      {notice && (
        <div className="fixed right-4 top-24 z-[70] flex max-w-sm items-start gap-3 rounded-xl border border-violet-400/30 bg-[#1b1728] p-4 shadow-2xl">
          <Info size={20} className="mt-0.5 shrink-0 text-violet-300" />
          <p className="flex-1 text-sm text-gray-100">{notice}</p>
          <button
            onClick={() => setNotice('')}
            className="text-gray-400 hover:text-white"
            aria-label="Fechar aviso"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* CONTEÚDO PRINCIPAL */}
      <main className="mx-auto max-w-7xl px-4 md:px-8">
        {/* DESTAQUE */}
        <section className="relative mt-8 overflow-hidden rounded-3xl border border-violet-400/15 bg-gradient-to-br from-[#21143a] via-[#171326] to-[#101017] px-6 py-12 md:mt-10 md:px-12 md:py-16">
          <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full bg-violet-600/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-28 left-1/3 h-64 w-64 rounded-full bg-fuchsia-500/10 blur-3xl" />

          <div className="relative z-10 max-w-2xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-violet-300/20 bg-violet-400/10 px-3 py-1.5 text-xs font-semibold text-violet-200">
              <Sparkles size={15} />
              O seu marketplace, do seu jeito
            </div>

            <h1 className="text-4xl font-black leading-tight tracking-tight md:text-6xl">
              Encontre. Negocie.
              <span className="block text-violet-400">Faça bons negócios.</span>
            </h1>

            <p className="mt-5 max-w-xl text-base leading-7 text-gray-300 md:text-lg">
              Descubra produtos da sua comunidade, encontre oportunidades e
              anuncie o que você não usa mais no Mercado Público.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <button
                onClick={() =>
                  document
                    .getElementById('produtos')
                    ?.scrollIntoView({ behavior: 'smooth' })
                }
                className="flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3.5 font-bold transition hover:bg-violet-500"
              >
                Explorar produtos
                <ArrowRight size={18} />
              </button>

              <button
                onClick={() => openSection('publish')}
                className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 py-3.5 font-bold transition hover:bg-white/10"
              >
                <Plus size={18} />
                Anunciar grátis
              </button>
            </div>

            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-gray-300">
              <span className="flex items-center gap-2">
                <ShieldCheck size={18} className="text-emerald-400" />
                Comunidade de compradores
              </span>
              <span className="flex items-center gap-2">
                <Zap size={18} className="text-amber-300" />
                Fácil de usar
              </span>
            </div>
          </div>
        </section>

        {/* CATEGORIAS */}
        <section className="py-12">
          <div className="mb-6 flex items-end justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-violet-400">
                ENCONTRE O QUE PROCURA
              </p>
              <h2 className="mt-1 text-2xl font-black md:text-3xl">
                Explore categorias
              </h2>
            </div>
            <button
              onClick={() => setCategory('Todas')}
              className="text-sm font-semibold text-gray-400 hover:text-white"
            >
              Ver todas
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
            {CATEGORIES.map((item) => {
              const Icon = item.icon;
              const selected = category === item.name;

              return (
                <button
                  key={item.name}
                  onClick={() => {
                    setCategory(selected ? 'Todas' : item.name);
                    setFavoritesOnly(false);
                  }}
                  className={`group rounded-2xl border p-4 text-left transition ${
                    selected
                      ? 'border-violet-400 bg-violet-500/15'
                      : 'border-white/10 bg-white/[0.025] hover:border-white/20 hover:bg-white/[0.05]'
                  }`}
                >
                  <span
                    className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl"
                    style={{
                      color: item.color,
                      backgroundColor: `${item.color}18`,
                    }}
                  >
                    <Icon size={22} />
                  </span>
                  <span className="text-sm font-bold">{item.name}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* PRODUTOS */}
        <section id="produtos" className="scroll-mt-28 pb-16">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-violet-400">
                OPORTUNIDADES PARA VOCÊ
              </p>
              <h2 className="mt-1 text-2xl font-black md:text-3xl">
                {favoritesOnly
                  ? 'Seus favoritos'
                  : category === 'Todas'
                    ? 'Produtos em destaque'
                    : category}
              </h2>
              <p className="mt-2 text-sm text-gray-400">
                {filteredProducts.length}{' '}
                {filteredProducts.length === 1
                  ? 'produto encontrado'
                  : 'produtos encontrados'}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFavoritesOnly((value) => !value)}
                className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-semibold transition ${
                  favoritesOnly
                    ? 'border-pink-400/30 bg-pink-400/10 text-pink-300'
                    : 'border-white/10 text-gray-300 hover:bg-white/5'
                }`}
              >
                <Heart size={17} />
                Favoritos
              </button>

              <button
                onClick={() => {
                  setSearch('');
                  setCategory('Todas');
                  setFavoritesOnly(false);
                }}
                className="flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2.5 text-sm text-gray-300 hover:bg-white/5"
              >
                <SlidersHorizontal size={17} />
                Limpar filtros
              </button>
            </div>
          </div>

          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredProducts.map((product) => (
                <article
                  key={product.id}
                  className="group overflow-hidden rounded-2xl border border-white/10 bg-[#121219] transition hover:-translate-y-1 hover:border-violet-400/30"
                >
                  <div
                    className="relative flex h-52 items-center justify-center overflow-hidden"
                    style={{ backgroundColor: product.color }}
                  >
                    <span className="select-none text-7xl transition duration-300 group-hover:scale-110">
                      {product.emoji}
                    </span>

                    <span className="absolute left-3 top-3 rounded-full border border-white/10 bg-black/35 px-3 py-1 text-xs font-semibold backdrop-blur">
                      {product.condition}
                    </span>

                    <button
                      onClick={() => toggleFavorite(product.id)}
                      className={`absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 backdrop-blur transition ${
                        favorites.includes(product.id)
                          ? 'bg-pink-500 text-white'
                          : 'bg-black/35 text-white hover:bg-black/60'
                      }`}
                      aria-label={
                        favorites.includes(product.id)
                          ? 'Remover dos favoritos'
                          : 'Adicionar aos favoritos'
                      }
                    >
                      <Heart
                        size={19}
                        fill={
                          favorites.includes(product.id)
                            ? 'currentColor'
                            : 'none'
                        }
                      />
                    </button>

                    {product.featured && (
                      <span className="absolute bottom-3 left-3 flex items-center gap-1 rounded-full bg-violet-600 px-3 py-1 text-xs font-bold">
                        <Sparkles size={13} />
                        Destaque
                      </span>
                    )}
                  </div>

                  <div className="p-4">
                    <p className="text-xs font-semibold text-violet-300">
                      {product.category}
                    </p>

                    <h3 className="mt-2 min-h-12 font-bold leading-6 text-white">
                      {product.name}
                    </h3>

                    <p className="mt-3 text-xl font-black">
                      {formatPrice(product.price)}
                    </p>

                    <p className="mt-3 flex items-center gap-1.5 text-sm text-gray-400">
                      <MapPin size={15} />
                      {product.location}
                    </p>

                    <button
                      onClick={() =>
                        showNotice(
                          'A página de detalhes e o contato com o vendedor ainda precisam ser implementados.'
                        )
                      }
                      className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 py-3 text-sm font-bold transition hover:border-violet-400/40 hover:bg-violet-500/10"
                    >
                      Ver produto
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-white/15 px-5 py-16 text-center">
              <Package size={40} className="mx-auto text-gray-500" />
              <h3 className="mt-4 text-lg font-bold">
                Nenhum produto encontrado
              </h3>
              <p className="mt-2 text-sm text-gray-400">
                Tente mudar a busca ou escolher outra categoria.
              </p>
              <button
                onClick={() => {
                  setSearch('');
                  setCategory('Todas');
                  setFavoritesOnly(false);
                }}
                className="mt-5 rounded-xl bg-violet-600 px-4 py-3 text-sm font-bold hover:bg-violet-500"
              >
                Limpar filtros
              </button>
            </div>
          )}
        </section>

        {/* ÁREA PARA ANUNCIAR */}
        <section className="mb-16 rounded-3xl border border-white/10 bg-gradient-to-r from-[#1c1730] to-[#14141b] p-6 md:flex md:items-center md:justify-between md:p-10">
          <div className="max-w-2xl">
            <p className="text-sm font-bold text-violet-300">
              TEM ALGO PARA VENDER?
            </p>
            <h2 className="mt-2 text-2xl font-black md:text-3xl">
              Seu próximo bom negócio começa aqui.
            </h2>
            <p className="mt-3 leading-7 text-gray-300">
              Prepare seu anúncio e conecte-se com pessoas que procuram o que
              você tem para oferecer.
            </p>
          </div>

          <button
            onClick={() => openSection('publish')}
            className="mt-6 flex shrink-0 items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3.5 font-bold transition hover:bg-violet-500 md:mt-0"
          >
            <Plus size={19} />
            Criar anúncio
          </button>
        </section>      {/* RODAPÉ */}
      <footer className="border-t border-white/10 bg-[#09090d]">
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-8">
          <div className="grid gap-8 md:grid-cols-3">
            <div>
              <button
                onClick={() => {
                  setSearch('');
                  setCategory('Todas');
                  setFavoritesOnly(false);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="flex items-center gap-2 text-left"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-600 font-black">
                  M
                </span>
                <span className="text-lg font-black">
                  Mercado <span className="text-violet-400">Público</span>
                </span>
              </button>

              <p className="mt-4 max-w-sm text-sm leading-6 text-gray-400">
                Um espaço para descobrir produtos, encontrar oportunidades e
                conectar compradores e vendedores.
              </p>
            </div>

            <div>
              <h3 className="font-bold">Marketplace</h3>
              <div className="mt-4 flex flex-col items-start gap-3 text-sm text-gray-400">
                <button
                  onClick={() => {
                    setCategory('Todas');
                    setFavoritesOnly(false);
                    document
                      .getElementById('produtos')
                      ?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="hover:text-white"
                >
                  Explorar produtos
                </button>

                <button
                  onClick={() => openSection('publish')}
                  className="hover:text-white"
                >
                  Anunciar produto
                </button>

                <button
                  onClick={() => openSection('login')}
                  className="hover:text-white"
                >
                  Minha conta
                </button>
              </div>
            </div>

            <div>
              <h3 className="font-bold">Sua conta</h3>
              <div className="mt-4 flex flex-col items-start gap-3 text-sm text-gray-400">
                <button
                  onClick={() => openSection('Área do comprador')}
                  className="hover:text-white"
                >
                  Área do comprador
                </button>

                <button
                  onClick={() => openSection('Área do vendedor')}
                  className="hover:text-white"
                >
                  Área do vendedor
                </button>

                <button
                  onClick={() => openSection('Área motoboy')}
                  className="hover:text-white"
                >
                  Área motoboy
                </button>

                <button
                  onClick={() => openSection('Denúncias')}
                  className="hover:text-white"
                >
                  Denúncias
                </button>
              </div>
            </div>
          </div>

          <div className="mt-8 border-t border-white/10 pt-6 text-xs text-gray-500 sm:flex sm:items-center sm:justify-between">
            <p>
              © {new Date().getFullYear()} Mercado Público. Todos os direitos
              reservados.
            </p>
            <p className="mt-2 sm:mt-0">
              Compre e venda com responsabilidade.
            </p>
          </div>
        </div>
      </footer>

      {/* MODAL DE LOGIN E CADASTRO */}
      {authMode && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !authLoading) {
              setAuthMode(null);
              setAuthError('');
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="auth-title"
            className="my-auto w-full max-w-md rounded-3xl border border-white/10 bg-[#14141c] p-6 shadow-2xl sm:p-8"
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-600/20 text-violet-300">
                  <CircleUserRound size={27} />
                </div>

                <h2 id="auth-title" className="text-2xl font-black">
                  {authMode === 'signup'
                    ? 'Crie sua conta'
                    : 'Bem-vindo de volta'}
                </h2>

                <p className="mt-2 text-sm leading-6 text-gray-400">
                  {authMode === 'signup'
                    ? 'Cadastre-se para começar a usar o Mercado Público.'
                    : 'Entre para acessar sua conta no Mercado Público.'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (authLoading) return;
                  setAuthMode(null);
                  setAuthError('');
                }}
                disabled={authLoading}
                aria-label="Fechar janela"
                className="rounded-xl p-2 text-gray-400 transition hover:bg-white/5 hover:text-white disabled:opacity-50"
              >
                <X size={21} />
              </button>
            </div>

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="auth-email"
                  className="mb-2 block text-sm font-semibold text-gray-200"
                >
                  E-mail
                </label>

                <input
                  id="auth-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="voce@exemplo.com"
                  className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-violet-500"
                />
              </div>

              <div>
                <label
                  htmlFor="auth-password"
                  className="mb-2 block text-sm font-semibold text-gray-200"
                >
                  Senha
                </label>

                <input
                  id="auth-password"
                  type="password"
                  autoComplete={
                    authMode === 'signup'
                      ? 'new-password'
                      : 'current-password'
                  }
                  minLength={6}
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder={
                    authMode === 'signup'
                      ? 'Crie uma senha com pelo menos 6 caracteres'
                      : 'Digite sua senha'
                  }
                  className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-violet-500"
                />

                {authMode === 'signup' && (
                  <p className="mt-2 text-xs text-gray-500">
                    Use pelo menos 6 caracteres. Não compartilhe sua senha.
                  </p>
                )}
              </div>

              {authError && (
                <div
                  role="alert"
                  className="rounded-xl border border-red-400/20 bg-red-400/10 p-3 text-sm leading-6 text-red-200"
                >
                  {authError}
                </div>
              )}

              <button
                type="submit"
                disabled={authLoading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3.5 font-bold transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {authLoading
                  ? 'Aguarde...'
                  : authMode === 'signup'
                    ? 'Criar minha conta'
                    : 'Entrar na conta'}

                {!authLoading && <ArrowRight size={18} />}
              </button>
            </form>

            <div className="my-5 flex items-center gap-3">
              <div className="h-px flex-1 bg-white/10" />
              <span className="text-xs text-gray-500">OU</span>
              <div className="h-px flex-1 bg-white/10" />
            </div>

            <p className="text-center text-sm text-gray-400">
              {authMode === 'signup'
                ? 'Já tem uma conta?'
                : 'Ainda não tem uma conta?'}{' '}
              <button
                type="button"
                disabled={authLoading}
                onClick={() => {
                  setAuthError('');
                  setAuthMode((mode) =>
                    mode === 'signup' ? 'login' : 'signup'
                  );
                }}
                className="font-bold text-violet-300 hover:text-violet-200 disabled:opacity-50"
              >
                {authMode === 'signup' ? 'Entrar' : 'Cadastre-se'}
              </button>
            </p>

            <p className="mt-5 text-center text-xs leading-5 text-gray-500">
              Ao usar a plataforma, proteja seus dados e negocie com
              responsabilidade.
            </p>
          </section>
        </div>
      )}    </div>
  );
}
