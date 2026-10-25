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
          onMouseDown={(event) => { if (event.target === event.currentTarget) setAuthMode(null); }}
          style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'grid', placeItems: 'center', padding: 20, background: 'rgba(5, 5, 12, .78)', backdropFilter: 'blur(8px)' }}
        >
          <section
            role="dialog"
