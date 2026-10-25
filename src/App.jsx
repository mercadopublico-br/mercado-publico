
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
      setAuthError('A conexão com o Supabase não foi carregada. Confira as configurações do projeto.');
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
          showNotice('Cadastro iniciado! Confira seu e-mail para confirmar a conta.');
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
      setAuthError(error.message || 'Não foi possível concluir a operação.');
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

  useEffect(() => {
    if (!notice) return undefined;

    const timeout = window.setTimeout(() => {
      setNotice('');
    }, 3500);

    return () => window.clearTimeout(timeout);
  }, [notice]);

  const filteredProducts = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase('pt-BR');

    return DEMO_PRODUCTS.filter((product) => {
      const searchableText = [
        product.name,
        product.category,
        product.location,
        product.condition,
      ]
        .join(' ')
        .toLocaleLowerCase('pt-BR');

      const matchesSearch = searchableText.includes(normalizedSearch);
      const matchesCategory =
        category === 'Todas' || product.category === category;
      const matchesFavorites =
        !favoritesOnly || favorites.includes(product.id);

      return matchesSearch && matchesCategory && matchesFavorites;
    });
  }, [search, category, favorites, favoritesOnly]);

  function showNotice(message) {
    setNotice(message);
  }

  function toggleFavorite(id) {
    const alreadyFavorite = favorites.includes(id);

    setFavorites((current) =>
      alreadyFavorite
        ? current.filter((favoriteId) => favoriteId !== id)
        : [...current, id]
    );

    showNotice(
      alreadyFavorite
        ? 'Anúncio removido dos favoritos.'
        : 'Anúncio adicionado aos favoritos.'
    );
  }

  function selectCategory(name) {
    setCategory((current) => (current === name ? 'Todas' : name));
    setFavoritesOnly(false);
  }

  function clearFilters() {
    setSearch('');
    setCategory('Todas');
    setFavoritesOnly(false);
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
        showNotice('Crie sua conta ou entre para continuar.');
        return;
      }

      showNotice('Sua conta está conectada! A publicação de anúncios reais ainda precisa ser implementada.');
      return;
    }

    document.getElementById(section)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }

  return (
    <div className="app-shell" id="inicio">
      <div className="announcement">
        <Sparkles size={14} aria-hidden="true" />
        <span>Seu próximo bom negócio começa aqui.</span>
        <span className="announcement-extra">
          Novas oportunidades em um só lugar.
        </span>
      </div>

      <header className="site-header">
        <a
          className="brand"
          href="#inicio"
          aria-label="Mercado Público — página inicial"
        >
          <span className="brand-mark">
            <Package size={25} aria-hidden="true" />
          </span>
          <span className="brand-word">
            mercado<span className="brand-accent">público</span>
            <small>SEU LUGAR DE BONS NEGÓCIOS</small>
          </span>
        </a>

        <nav
          className={`desktop-nav ${menuOpen ? 'nav-open' : ''}`}
          aria-label="Navegação principal"
        >
          <a
            className="nav-active"
            href="#inicio"
            onClick={() => setMenuOpen(false)}
          >
            Início
          </a>
          <a href="#categorias" onClick={() => setMenuOpen(false)}>
            Categorias
          </a>
          <a href="#anuncios" onClick={() => setMenuOpen(false)}>
            Explorar anúncios
          </a>
        </nav>

        <div className="header-actions">
          <button
            type="button"
            className={`icon-button favorite-nav ${
              favoritesOnly ? 'is-active' : ''
            }`}
            onClick={() => {
              setFavoritesOnly((current) => !current);
              document.getElementById('anuncios')?.scrollIntoView({
                behavior: 'smooth',
              });
            }}
            aria-label={
              favoritesOnly
                ? 'Mostrar todos os anúncios'
                : 'Mostrar favoritos'
            }
            title="Favoritos"
          >
            <Heart size={19} />
            {favorites.length > 0 && (
              <span className="favorite-count">{favorites.length}</span>
            )}
          </button>

          {user ? (
            <button
              type="button"
              className="button button-outline header-login"
              onClick={handleSignOut}
              title={user.email || 'Conta conectada'}
            >
              <CircleUserRound size={17} />
              Sair
            </button>
          ) : (
            <button
              type="button"
              className="button button-outline header-login"
              onClick={() => openSection('login')}
            >
              <CircleUserRound size={17} />
              Entrar
            </button>
          )}

          <button
            type="button"
            className="button button-primary"
            onClick={() => openSection('publish')}
          >
            <Plus size={18} />
            Anunciar grátis
          </button>

          <button
            type="button"
            className="icon-button mobile-menu"
            onClick={() => setMenuOpen((current) => !current)}
            aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="hero-copy">
            <div className="eyebrow">
              <span className="live-dot" />
              Um marketplace para novas possibilidades
            </div>

            <h1>
              Encontre. Negocie.
              <br />
              <span>Faça bons negócios.</span>
            </h1>

            <p>
              Do que você precisa ao que deseja vender: descubra novas
              possibilidades e encontre oportunidades em um só lugar.
            </p>

            <form
              className="search-box"
              role="search"
              onSubmit={(event) => {
                event.preventDefault();
                openSection('anuncios');
              }}
            >
              <Search size={21} aria-hidden="true" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="O que você está procurando?"
                aria-label="Buscar anúncios por nome, categoria ou local"
              />
              {search && (
                <button
                  type="button"
                  className="search-clear"
                  onClick={() => setSearch('')}
                  aria-label="Limpar pesquisa"
                >
                  <X size={17} />
                </button>
              )}
              <button type="submit" className="search-submit">
                Buscar <ArrowRight size={17} />
              </button>
            </form>

            <div className="hero-trust">
              <span>
                <ShieldCheck size={16} />
                Mais clareza na negociação
              </span>
              <span>
                <Zap size={16} />
                Fácil de explorar
              </span>
            </div>
          </div>

          <div
            className="hero-art"
            aria-label="Ilustração de destaque do marketplace"
          >
            <div className="art-orbit orbit-one" />
            <div className="art-orbit orbit-two" />
            <div className="art-glow" />

            <div className="floating-card card-top">
              <span>✨</span>
              <div>
                <strong>Novas possibilidades</strong>
                <small>Explore algo diferente</small>
              </div>
            </div>

            <div className="hero-cube">
              <Package size={100} strokeWidth={1.1} />
            </div>

            <div className="floating-card card-bottom">
              <span className="mini-check">
                <ShieldCheck size={19} />
              </span>
              <div>
                <strong>Seu próximo achado</strong>
                <small>Pode estar mais perto</small>
              </div>
            </div>

            <div className="art-spark spark-one">✦</div>
            <div className="art-spark spark-two">✧</div>
          </div>
        </section>

        <section className="trust-strip" aria-label="Vantagens">
          <div>
            <ShieldCheck size={22} />
            <span>
              <strong>Negocie com atenção</strong>
              <small>Confira os detalhes de cada anúncio</small>
            </span>
          </div>
          <div>
            <MessageCircle size={22} />
            <span>
              <strong>Converse diretamente</strong>
              <small>Combine os detalhes com o vendedor</small>
            </span>
          </div>
          <div>
            <TrendingUp size={22} />
            <span>
              <strong>Descubra oportunidades</strong>
              <small>Explore opções para seu orçamento</small>
            </span>
          </div>
        </section>

        <section
          className="section categories-section"
          id="categorias"
        >
          <div className="section-heading">
            <div>
              <span className="section-kicker">EXPLORE DO SEU JEITO</span>
              <h2>O que você procura?</h2>
              <p>
                Escolha uma categoria e descubra novas possibilidades.
              </p>
            </div>

            <button
              type="button"
              className="text-link"
              onClick={() => {
                setCategory('Todas');
                setFavoritesOnly(false);
              }}
            >
              Ver todas <ArrowRight size={17} />
            </button>
          </div>

          <div className="category-grid">
            {CATEGORIES.map(({ name, icon: Icon, color }) => {
              const selected = category === name;

              return (
                <button
                  type="button"
                  key={name}
                  className={`category-card ${
                    selected ? 'category-selected' : ''
                  }`}
                  onClick={() => {
                    selectCategory(name);
                    openSection('anuncios');
                  }}
                  aria-pressed={selected}
                >
                  <span
                    className="category-icon"
                    style={{ '--category-color': color }}
                  >
                    <Icon size={25} strokeWidth={1.7} />
                  </span>
                  <strong>{name}</strong>
                  <ArrowRight
                    size={16}
                    className="category-arrow"
                    aria-hidden="true"
                  />
                </button>
              );
            })}
          </div>
        </section>

        <section className="section products-section" id="anuncios">
          <div className="section-heading">
            <div>
              <span className="section-kicker">DESCUBRA OPORTUNIDADES</span>
              <h2>
                {favoritesOnly
                  ? 'Seus favoritos'
                  : category === 'Todas'
                    ? 'Anúncios em destaque'
                    : category}
              </h2>
              <p>
                {favoritesOnly
                  ? 'Os anúncios que você marcou para rever.'
                  : 'Explore produtos e encontre seu próximo achado.'}
              </p>
            </div>

            <div className="product-tools">
              <span className="result-count" aria-live="polite">
                {filteredProducts.length}{' '}
                {filteredProducts.length === 1 ? 'anúncio' : 'anúncios'}
              </span>

              <button
                type="button"
                className="filter-button"
                onClick={clearFilters}
              >
                <SlidersHorizontal size={17} />
                Limpar filtros
              </button>
            </div>
          </div>

          <div className="demo-notice">
            <Info size={17} />
            <span>
              <strong>Prévia do marketplace:</strong> os produtos exibidos
              são exemplos. Os anúncios reais serão conectados ao banco de
              dados antes do lançamento.
            </span>
          </div>

          {filteredProducts.length > 0 ? (
            <div className="product-grid">
              {filteredProducts.map((product) => {
                const isFavorite = favorites.includes(product.id);

                return (
                  <article className="product-card" key={product.id}>
                    <div
                      className="product-visual"
                      style={{ '--product-color': product.color }}
                    >
                      {product.featured && (
                        <span className="product-badge">
                          <Sparkles size={12} />
                          Destaque
                        </span>
                      )}

                      <button
                        type="button"
                        className={`product-favorite ${
                          isFavorite ? 'is-favorite' : ''
                        }`}
                        onClick={() => toggleFavorite(product.id)}
                        aria-label={
                          isFavorite
                            ? `Remover ${product.name} dos favoritos`
                            : `Adicionar ${product.name} aos favoritos`
                        }
                        aria-pressed={isFavorite}
                      >
                        <Heart
                          size={19}
                          fill={isFavorite ? 'currentColor' : 'none'}
                        />
                      </button>

                      <span className="product-emoji" aria-hidden="true">
                        {product.emoji}
                      </span>
                    </div>

                    <div className="product-info">
                      <span className="product-category">
                        {product.category}
                        <span aria-hidden="true"> · </span>
                        {product.condition}
                      </span>

                      <h3>{product.name}</h3>

                      <strong className="product-price">
                        {formatPrice(product.price)}
                      </strong>

                      <span className="product-location">
                        <MapPin size={14} />
                        {product.location}
                      </span>

                      <button
                        type="button"
                        className="product-contact"
                        onClick={() =>
                          showNotice(
                            'O contato com o anunciante será habilitado quando os anúncios reais estiverem conectados.'
                          )
                        }
                      >
                        Tenho interesse <ArrowRight size={16} />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="empty-state">
              <Search size={30} />
              <h3>
                {favoritesOnly
                  ? 'Você ainda não tem favoritos'
                  : 'Nenhum anúncio encontrado'}
              </h3>
              <p>
                {favoritesOnly
                  ? 'Use o coração nos anúncios para salvá-los aqui.'
                  : 'Experimente outra busca ou remova os filtros.'}
              </p>
              <button
                type="button"
                className="button button-primary"
                onClick={clearFilters}
              >
                Ver todos os anúncios
              </button>
            </div>
          )}
        </section>

        <section className="sell-banner" id="vender">
          <div className="sell-icon">
            <Package size={29} />
          </div>

          <div className="sell-copy">
            <span className="section-kicker">TEM ALGO PARA VENDER?</span>
            <h2>Seu próximo negócio pode começar aqui.</h2>
            <p>
              Prepare seu anúncio e encontre pessoas interessadas no que
              você oferece.
            </p>
          </div>

          <button
            type="button"
            className="button button-primary sell-button"
            onClick={() => openSection('publish')}
          >
            Começar a anunciar <ArrowRight size={18} />
          </button>
        </section>
      </main>

      <footer className="site-footer">
        <a className="brand footer-brand" href="#inicio">
          <span className="brand-mark">
            <Package size={23} />
          </span>
          <span className="brand-word">
            mercado<span className="brand-accent">público</span>
            <small>SEU LUGAR DE BONS NEGÓCIOS</small>
          </span>
        </a>

        <p>Boas oportunidades aproximam pessoas.</p>

        <span className="footer-copy">
          © {new Date().getFullYear()} Mercado Público.
        </span>
      </footer>

      {authMode && (
        <div
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !authLoading) {
              setAuthMode(null);
              setAuthError('');
            }
          }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            display: 'grid',
            placeItems: 'center',
            padding: 20,
            background: 'rgba(5, 5, 12, .82)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="auth-title"
            style={{
              width: '100%',
              maxWidth: 420,
              padding: 28,
              borderRadius: 20,
              border: '1px solid rgba(167, 139, 250, .3)',
              background: '#11111b',
              color: '#f5f3ff',
              boxShadow: '0 24px 80px rgba(0,0,0,.4)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 22 }}>
              <div>
                <span style={{ color: '#a78bfa', fontSize: 12, fontWeight: 700, letterSpacing: 1 }}>
                  MERCADO PÚBLICO
                </span>
                <h2 id="auth-title" style={{ margin: '8px 0 0', fontSize: 25 }}>
                  {authMode === 'signup' ? 'Crie sua conta' : 'Bem-vindo de volta'}
                </h2>
              </div>
              <button
                type="button"
                className="icon-button"
                aria-label="Fechar janela"
                disabled={authLoading}
                onClick={() => { setAuthMode(null); setAuthError(''); }}
              >
                <X size={21} />
              </button>
            </div>

            <p style={{ color: '#b8b5c9', lineHeight: 1.6 }}>
              {authMode === 'signup'
                ? 'Cadastre-se com seu e-mail para começar.'
                : 'Entre com seu e-mail e sua senha para continuar.'}
            </p>

            <form onSubmit={handleAuthSubmit} style={{ display: 'grid', gap: 14, marginTop: 22 }}>
              <label style={{ display: 'grid', gap: 7 }}>
                <span style={{ fontSize: 14 }}>E-mail</span>
                <input
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="voce@exemplo.com"
                  disabled={authLoading}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '13px 14px', borderRadius: 10, border: '1px solid #393449', background: '#191825', color: '#fff', fontSize: 15 }}
                />
              </label>

              <label style={{ display: 'grid', gap: 7 }}>
                <span style={{ fontSize: 14 }}>Senha</span>
                <input
                  type="password"
                  autoComplete={authMode === 'signup' ? 'new-password' : 'current-password'}
                  required
                  minLength={6}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Mínimo de 6 caracteres"
                  disabled={authLoading}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '13px 14px', borderRadius: 10, border: '1px solid #393449', background: '#191825', color: '#fff', fontSize: 15 }}
                />
              </label>

              {authError && (
                <p role="alert" style={{ margin: 0, padding: 12, borderRadius: 9, background: 'rgba(248,113,113,.1)', color: '#fca5a5', fontSize: 14, lineHeight: 1.5 }}>
                  {authError}
                </p>
              )}

              <button
                type="submit"
                className="button button-primary"
                disabled={authLoading}
                style={{ width: '100%', justifyContent: 'center', marginTop: 5, opacity: authLoading ? 0.7 : 1 }}
              >
                {authLoading ? 'Aguarde...' : authMode === 'signup' ? 'Criar minha conta' : 'Entrar na minha conta'}
              </button>
            </form>

            <p style={{ marginTop: 22, textAlign: 'center', color: '#b8b5c9', fontSize: 14 }}>
              {authMode === 'signup' ? 'Já tem uma conta?' : 'Ainda não tem uma conta?'}{' '}
              <button
                type="button"
                onClick={() => { setAuthError(''); setPassword(''); setAuthMode(authMode === 'signup' ? 'login' : 'signup'); }}
                disabled={authLoading}
                style={{ border: 0, padding: 0, background: 'transparent', color: '#c4b5fd', fontWeight: 700, cursor: 'pointer' }}
              >
                {authMode === 'signup' ? 'Entrar' : 'Cadastre-se'}
              </button>
            </p>
          </section>
        </div>
      )}

      {notice && (
        <div className="toast" role="status">
          <Info size={18} />
          <span>{notice}</span>
          <button
            type="button"
            onClick={() => setNotice('')}
            aria-label="Fechar mensagem"
          >
            <X size={17} />
          </button>
        </div>
      )}
    </div>
  );
}
