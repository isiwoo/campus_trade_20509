import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, HeartHandshake, Leaf, Plus, Search, ShieldCheck, Sparkles, X } from 'lucide-react';
import { api, CATEGORIES } from '../api.js';
import EmptyState from '../components/EmptyState.jsx';
import ProductCard from '../components/ProductCard.jsx';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState('전체');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    const timer = setTimeout(() => {
      const params = new URLSearchParams();
      if (category !== '전체') params.set('category', category);
      if (status !== 'ALL') params.set('status', status);
      if (search.trim()) params.set('q', search.trim());
      setLoading(true);
      api(`/products?${params}`).then(data => { if (active) { setProducts(data.products); setError(''); } })
        .catch(err => { if (active) setError(err.message); })
        .finally(() => { if (active) setLoading(false); });
    }, 200);
    return () => { active = false; clearTimeout(timer); };
  }, [category, search, status]);

  return <>
    <section className="hero-section">
      <div className="container hero-grid">
        <div className="hero-copy">
          <div className="eyebrow"><Sparkles size={15}/> 우리 학교에서 시작하는 작은 순환</div>
          <h1>좋은 물건의<br/><span>두 번째 이야기.</span></h1>
          <p>내게는 더 이상 필요 없지만, 누군가에게는 꼭 필요한 물건.<br className="desktop-only"/> 우리 학교 친구들과 쉽고 가깝게 나눠 보세요.</p>
          <div className="hero-actions"><a className="btn btn-primary btn-large" href="#market">물건 둘러보기 <ArrowRight size={19}/></a><Link to="/products/new" className="btn btn-outline btn-large"><Plus size={19}/> 내 물건 올리기</Link></div>
          <div className="hero-features"><span><ShieldCheck size={16}/> 학교 안에서 안심 거래</span><span><Leaf size={16}/> 함께 실천하는 자원 순환</span></div>
        </div>
        <div className="hero-visual" aria-label="책, 가방, 이어폰, 운동화 등 다양한 중고 물건의 일러스트">
          <span className="hero-orbit orbit-one"></span><span className="hero-orbit orbit-two"></span>
          <div className="hero-floating floating-top">✦ 새로운 발견</div>
          <div className="hero-big-card"><div className="hero-illustration"><span className="hero-obj obj-bag">🎒</span><span className="hero-obj obj-book">📚</span><span className="hero-obj obj-headphones">🎧</span><span className="hero-obj obj-pencil">✏️</span></div><div className="hero-card-label"><span>오늘의 작은 발견</span><strong>다시 쓰는 즐거움</strong></div></div>
          <div className="hero-floating floating-bottom"><HeartHandshake size={19}/> 이웃 학교가 아닌, 우리 학교</div>
          <span className="hero-doodle">✳</span>
        </div>
      </div>
    </section>

    <section className="value-strip"><div className="container value-grid"><div><span className="value-icon">🤝</span><span><strong>가까운 거래</strong><small>학교 안에서 편하게 만나기</small></span></div><div><span className="value-icon">🌱</span><span><strong>지속 가능한 소비</strong><small>물건에 새로운 가치 더하기</small></span></div><div><span className="value-icon">💛</span><span><strong>우리만의 장터</strong><small>학생들이 함께 만드는 공간</small></span></div></div></section>

    <section id="market" className="container market-section">
      <div className="section-heading"><div><span className="section-kicker">OUR MARKETPLACE</span><h2>지금 올라온 물건들 <span className="heading-star">✳</span></h2><p>우리 학교 친구들이 올린 물건을 구경해 보세요.</p></div><Link to="/products/new" className="btn btn-ghost"><Plus size={17}/> 상품 등록하기</Link></div>
      <div className="search-row"><div className="search-field"><Search size={19}/><input aria-label="상품 검색" placeholder="찾고 있는 물건이 있나요? (예: 수학 문제집)" value={search} onChange={e => setSearch(e.target.value)} />{search && <button type="button" aria-label="검색어 지우기" onClick={() => setSearch('')}><X size={17}/></button>}</div><select aria-label="거래 상태" className="status-select" value={status} onChange={e => setStatus(e.target.value)}><option value="ALL">전체 거래 상태</option><option value="SELLING">거래 가능</option><option value="RESERVED">예약 중</option><option value="COMPLETED">거래 완료</option></select></div>
      <div className="category-tabs" aria-label="상품 분류">{CATEGORIES.map(item => <button key={item} type="button" className={`category-tab ${category === item ? 'active' : ''}`} onClick={() => setCategory(item)}>{item}</button>)}</div>
      <div className="results-line"><strong>{loading ? '상품을 불러오는 중' : `전체 ${products.length}개 상품`}</strong><span>최근 등록순</span></div>
      {error && <div className="alert error">{error} <button className="link-button" onClick={() => window.location.reload()}>새로고침</button></div>}
      {loading && !error ? <div className="loading-grid">{Array.from({ length: 8 }, (_,i) => <div className="skeleton-card" key={i}><div/><span/><small/></div>)}</div> : !error && products.length ? <div className="product-grid">{products.map(p => <ProductCard product={p} key={p.id} />)}</div> : !error && <EmptyState title={search || category !== '전체' ? '조건에 맞는 물건이 없어요' : '아직 등록된 상품이 없어요'} description="다른 검색어를 사용하거나 새 상품을 올려 보세요." />}
    </section>
    <section className="container bottom-banner"><div><span className="banner-chip">TOGETHER, BETTER</span><h2>안 쓰는 물건에<br/>다시 한 번 기회를.</h2><p>버리기 전에, 필요한 친구를 찾아 주세요.</p><Link to="/products/new" className="btn btn-light">지금 등록하기 <ArrowRight size={17}/></Link></div><span className="bottom-banner-art" aria-hidden="true">📦<i>✨</i></span></section>
  </>;
}
