import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Package, Plus, Save, ShieldCheck, Trash2, UserRound } from 'lucide-react';
import { api } from '../api.js';
import { useAuth } from '../AuthContext.jsx';
import ProductCard from '../components/ProductCard.jsx';
import EmptyState from '../components/EmptyState.jsx';

export default function MyPage() {
  const { user, updateProfile, clearUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: user.email, nickname: user.nickname, phone_number: user.phone_number, entry_year: String(user.entry_year), student_id: user.student_id, password: '', current_password: '' });
  const [products, setProducts] = useState([]);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [showDelete, setShowDelete] = useState(false);
  const [tab, setTab] = useState('products');
  useEffect(() => { api('/products').then(data => setProducts(data.products.filter(p=>p.seller_id===user.id))).catch(err=>setError(err.message)); }, [user.id]);
  const field = name => e => setForm(prev => ({ ...prev, [name]: e.target.value }));
  async function save(e) {
    e.preventDefault(); setBusy(true); setError(''); setMsg('');
    try { const result = await updateProfile(form); setMsg(result.message); setForm(prev=>({...prev,password:'',current_password:''})); }
    catch(err) { setError(err.message); }
    finally { setBusy(false); }
  }
  async function removeAccount(e) {
    e.preventDefault();
    if (!window.confirm('회원 탈퇴 시 모든 판매 게시글이 삭제됩니다. 정말 탈퇴하시겠습니까?')) return;
    setBusy(true); setError('');
    try { await api('/auth/me', { method:'DELETE', body:{ password: deletePassword } }); clearUser(); navigate('/'); }
    catch(err) { setError(err.message); setBusy(false); }
  }
  return <div className="container my-page"><div className="page-top"><div><span className="section-kicker">MY DASHBOARD</span><h1>마이페이지 <span className="heading-star">✳</span></h1><p>나의 거래와 계정 정보를 한곳에서 관리해요.</p></div><span className="profile-big-avatar"><UserRound size={35}/></span></div><div className="my-summary"><div><span className="summary-icon">👋</span><div><small>안녕하세요!</small><h2>{user.nickname}<span>님</span></h2></div></div><div className="summary-stat"><strong>{products.length}</strong><span>등록한 물건</span></div><div className="summary-stat"><strong>{products.filter(p=>p.status==='SELLING').length}</strong><span>거래 가능한 물건</span></div></div><div className="my-tabs"><button className={tab==='products'?'active':''} onClick={()=>setTab('products')}><Package size={17}/> 내 상품 관리</button><button className={tab==='profile'?'active':''} onClick={()=>setTab('profile')}><UserRound size={17}/> 프로필 수정</button></div>{tab === 'products' ? <><div className="mini-section-heading"><h2>내가 올린 물건</h2><Link to="/products/new" className="btn btn-primary btn-sm"><Plus size={16}/> 등록하기</Link></div>{products.length ? <div className="product-grid">{products.map(p=><ProductCard key={p.id} product={p}/>)}</div> : <EmptyState/>}</> : <div className="form-card wide profile-form"><div className="form-section-title"><ShieldCheck size={20}/> 내 정보 관리</div><form className="form-stack" onSubmit={save}><label>이메일<input required type="email" maxLength="100" value={form.email} onChange={field('email')}/></label><div className="form-columns"><label>닉네임<input minLength="2" maxLength="50" required value={form.nickname} onChange={field('nickname')}/></label><label>연락처<input required maxLength="20" value={form.phone_number} onChange={field('phone_number')}/></label></div><div className="form-columns"><label>입학 연도<input required type="number" min="2000" max="2100" value={form.entry_year} onChange={field('entry_year')}/></label><label>학번<input required minLength="3" maxLength="10" value={form.student_id} onChange={field('student_id')}/></label></div><div className="form-section-title space-top">비밀번호 변경 <span className="optional">변경하지 않으려면 비워 두세요</span></div><div className="form-columns"><label>현재 비밀번호<input type="password" placeholder="현재 비밀번호" autoComplete="current-password" value={form.current_password} onChange={field('current_password')}/></label><label>새 비밀번호<input type="password" placeholder="8자 이상" minLength="8" maxLength="72" autoComplete="new-password" value={form.password} onChange={field('password')}/></label></div>{msg && <div className="alert success">{msg}</div>}{error && <div className="alert error">{error}</div>}<button type="submit" disabled={busy} className="btn btn-primary profile-save"><Save size={17}/> {busy ? '저장 중...' : '변경사항 저장'}</button></form><div className="delete-area"><div><strong>회원 탈퇴</strong><p>탈퇴하면 계정과 등록한 상품이 함께 삭제됩니다.</p></div><button type="button" className="btn btn-danger" onClick={()=>setShowDelete(v=>!v)}><Trash2 size={16}/> 회원 탈퇴</button></div>{showDelete && <form className="delete-form" onSubmit={removeAccount}><label>탈퇴 확인 비밀번호<input type="password" required placeholder="현재 비밀번호 입력" value={deletePassword} onChange={e=>setDeletePassword(e.target.value)}/></label><button disabled={busy} className="btn btn-danger" type="submit">탈퇴 확정 <ArrowRight size={16}/></button></form>}</div>}</div>;
}
