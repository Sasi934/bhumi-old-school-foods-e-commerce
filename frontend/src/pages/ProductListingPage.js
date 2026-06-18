import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useLang } from '../context/LangContext';
import ProductCard from '../components/ProductCard';
import './ProductListingPage.css';

const CATEGORIES = [
  { slug: 'flours-mixes',      en: 'Flours & Mixes',     te: 'పిండి & మిక్స్' },
  { slug: 'millets',           en: 'Millets',             te: 'చిరుధాన్యాలు' },
  { slug: 'rice-pulses',       en: 'Rice & Pulses',       te: 'బియ్యం & పప్పు' },
  { slug: 'spices-powders',    en: 'Spices & Powders',    te: 'మసాలాలు' },
  { slug: 'cold-pressed-oils', en: 'Cold Pressed Oils',   te: 'చల్లని నూనెలు' },
  { slug: 'pickles',           en: 'Pickles',             te: 'ఊరగాయలు' },
  { slug: 'natural-care',      en: 'Natural Care',        te: 'సహజ సంరక్షణ' },
  { slug: 'sweeteners-snacks', en: 'Snacks & Sweets',     te: 'స్నాక్స్ & తీపి' },
];

const ProductListingPage = () => {
  const { category } = useParams();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(category || '');
  const [sortBy, setSortBy] = useState('featured');
  const [filterOpen, setFilterOpen] = useState(false);
  const { t } = useLang();

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from('products')
      .select('*, categories(name, name_telugu, slug)')
      .eq('is_available', true);

    if (activeCategory) {
      const { data: cat } = await supabase
        .from('categories').select('id').eq('slug', activeCategory).single();
      if (cat) query = query.eq('category_id', cat.id);
    }

    if (searchQuery) {
      query = query.or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
    }

    if (sortBy === 'featured') query = query.order('is_featured', { ascending: false }).order('name');
    else if (sortBy === 'name-asc') query = query.order('name');
    else if (sortBy === 'name-desc') query = query.order('name', { ascending: false });
    else if (sortBy === 'price-asc') query = query.order('price', { ascending: true });
    else if (sortBy === 'price-desc') query = query.order('price', { ascending: false });

    const { data } = await query;
    setProducts(data || []);
    setLoading(false);
  }, [activeCategory, searchQuery, sortBy]);

  useEffect(() => {
    setActiveCategory(category || '');
  }, [category]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const activeCat = CATEGORIES.find(c => c.slug === activeCategory);
  const pageTitle = searchQuery
    ? t(`Search: "${searchQuery}"`, `వెతుకు: "${searchQuery}"`)
    : activeCat ? t(activeCat.en, activeCat.te) : t('All Organic Goods', 'అన్ని సేంద్రీయ వస్తువులు');

  return (
    <main className="listing-page">
      {/* Header */}
      <div className="listing-header">
        <div className="container">
          <p className="eyebrow" style={{color:'var(--gold)'}}>
            {t('The Harvest', 'పంట')}
          </p>
          <h1 className="display-lg listing-title">{pageTitle}</h1>
          <p className="listing-count body-sm">
            {loading ? t('Loading...', 'లోడ్ అవుతోంది...') : `${products.length} ${t('products', 'ఉత్పత్తులు')}`}
          </p>
        </div>
      </div>

      <div className="container listing-body">
        {/* Sidebar Filters */}
        <aside className={`listing-sidebar ${filterOpen ? 'open' : ''}`}>
          <div className="sidebar-section">
            <h3 className="sidebar-heading">{t('Category', 'వర్గం')}</h3>
            <button
              className={`sidebar-cat ${!activeCategory ? 'active' : ''}`}
              onClick={() => setActiveCategory('')}
            >
              {t('All Products', 'అన్ని ఉత్పత్తులు')}
            </button>
            {CATEGORIES.map(cat => (
              <button
                key={cat.slug}
                className={`sidebar-cat ${activeCategory === cat.slug ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat.slug)}
              >
                {t(cat.en, cat.te)}
              </button>
            ))}
          </div>
        </aside>

        {/* Main Content */}
        <div className="listing-main">
          {/* Controls */}
          <div className="listing-controls">
            <button className="filter-toggle-btn" onClick={() => setFilterOpen(!filterOpen)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/>
              </svg>
              {t('Filter', 'ఫిల్టర్')}
            </button>

            <div className="category-chips">
              <button className={`chip ${!activeCategory ? 'active' : ''}`} onClick={() => setActiveCategory('')}>
                {t('All', 'అన్నీ')}
              </button>
              {CATEGORIES.map(cat => (
                <button key={cat.slug}
                  className={`chip ${activeCategory === cat.slug ? 'active' : ''}`}
                  onClick={() => setActiveCategory(cat.slug)}>
                  {t(cat.en, cat.te)}
                </button>
              ))}
            </div>

            <select className="sort-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
              <option value="featured">{t('Sort: Featured', 'క్రమబద్ధం: ఫీచర్డ్')}</option>
              <option value="name-asc">{t('Name: A→Z', 'పేరు: A→Z')}</option>
              <option value="name-desc">{t('Name: Z→A', 'పేరు: Z→A')}</option>
              <option value="price-asc">{t('Price: Low to High', 'ధర: తక్కువ నుండి')}</option>
              <option value="price-desc">{t('Price: High to Low', 'ధర: ఎక్కువ నుండి')}</option>
            </select>
          </div>

          {/* Breadcrumb */}
          <div className="breadcrumb">
            <Link to="/">{t('Home', 'హోమ్')}</Link>
            <span>·</span>
            <Link to="/shop">{t('Shop', 'షాప్')}</Link>
            {activeCat && (
              <><span>·</span><span>{t(activeCat.en, activeCat.te)}</span></>
            )}
          </div>

          {/* Grid */}
          {loading ? (
            <div className="products-grid">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="product-skeleton" style={{aspectRatio:'3/4', background:'var(--cream-dark)', borderRadius:'var(--radius-lg)'}} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="no-products">
              <p>{t('No products found.', 'ఉత్పత్తులు కనుగొనబడలేదు.')}</p>
              <button className="btn btn-outline" onClick={() => setActiveCategory('')} style={{marginTop:'1rem'}}>
                {t('View All', 'అన్నీ చూడండి')}
              </button>
            </div>
          ) : (
            <div className="products-grid">
              {products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default ProductListingPage;
