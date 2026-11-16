import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { ArrowUpRight, Heart, LogIn, LogOut, Menu, Plus, Store, UserRound, X } from 'lucide-react';
import { useAuth } from '../AuthContext.jsx';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  async function handleLogout() {
    try { await logout(); navigate('/'); }
    catch (error) { window.alert(error.message); }
    setOpen(false);
  }

  return <div className="app-shell">
    <div className="announcement"><span className="announcement-spark">✦</span> 우리 학교 안에서, 더 가깝고 따뜻한 거래 <span className="announcement-spark">✦</span></div>
    <header className="site-header">
      <div className="container nav-inner">
        <Link to="/" className="brand" aria-label="다시마켓 홈" onClick={() => setOpen(false)}>
          <span className="brand-symbol"><Heart size={19} fill="currentColor" strokeWidth={2.6} /></span>
          <span>다시<span className="brand-accent">마켓</span><small>우리 학교 중고거래</small></span>
        </Link>
        <nav className={`nav-links ${open ? 'is-open' : ''}`} aria-label="주요 메뉴">
          <NavLink to="/" end onClick={() => setOpen(false)}>물건 둘러보기</NavLink>
          <NavLink to="/sellers" onClick={() => setOpen(false)}>판매자 현황</NavLink>
          {user && <NavLink to="/mypage" onClick={() => setOpen(false)}>마이페이지</NavLink>}
        </nav>
        <div className="nav-actions">
          {user ? <>
            <span className="hello-user">안녕하세요, <strong>{user.nickname}</strong>님</span>
            <button className="text-action" title="로그아웃" onClick={handleLogout}><LogOut size={17}/><span>로그아웃</span></button>
            <Link className="btn btn-primary btn-sm" to="/products/new"><Plus size={18}/> 상품 등록</Link>
          </> : <>
            <Link className="text-action" to="/login"><LogIn size={17}/> 로그인</Link>
            <Link className="btn btn-primary btn-sm" to="/register"><UserRound size={16}/> 회원가입</Link>
          </>}
        </div>
        <button className="mobile-menu-btn" aria-label={open ? '메뉴 닫기' : '메뉴 열기'} onClick={() => setOpen(value => !value)}>{open ? <X/> : <Menu/>}</button>
      </div>
    </header>
    <main><Outlet /></main>
    <footer className="footer">
      <div className="container footer-top">
        <div>
          <div className="footer-logo"><span className="brand-symbol"><Heart size={16} fill="currentColor"/></span> 다시마켓</div>
          <p>필요 없는 물건에는 새로운 주인을,<br/>우리 학교에는 더 좋은 연결을.</p>
        </div>
        <div className="footer-links"><Link to="/">상품 둘러보기 <ArrowUpRight size={14}/></Link><Link to="/sellers">판매자 현황 <ArrowUpRight size={14}/></Link><Link to={user ? '/mypage' : '/login'}>내 계정 <ArrowUpRight size={14}/></Link></div>
      </div>
      <div className="container footer-bottom"><span>© 2026 다시마켓. 학교 프로젝트로 제작되었습니다.</span><span><Store size={14}/> 학교 안에서 만나고, 안전하게 거래하세요.</span></div>
    </footer>
  </div>;
}
