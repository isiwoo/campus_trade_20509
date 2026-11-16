import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CalendarDays, MapPin, Pencil, Trash2, UserRound, ShieldCheck } from 'lucide-react';
import { api, formatDate, formatPrice, STATUS_LABELS } from '../api.js';
import { useAuth } from '../AuthContext.jsx';
import { ProductImage } from '../components/ProductCard.jsx';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => { let active = true; api(`/products/${id}`).then(data => { if(active) setProduct(data.product); }).catch(err => { if(active) setError(err.message); }); return () => { active = false; }; }, [id]);
  async function remove() {
    if (!window.confirm('정말 이 상품을 삭제할까요? 삭제하면 되돌릴 수 없습니다.')) return;
    setBusy(true);
    try { await api(`/products/${id}`, { method: 'DELETE' }); navigate('/mypage'); }
    catch (err) { setError(err.message); setBusy(false); }
  }
  if (error && !product) return <div className="container detail-error"><div className="alert error">{error}</div><Link className="btn btn-outline" to="/">목록으로 돌아가기</Link></div>;
  if (!product) return <div className="container loading-message">상품을 불러오는 중...</div>;
  const owner = user?.id === product.seller_id;
  return <div className="container detail-page"><Link to="/" className="back-link"><ArrowLeft size={17}/> 전체 상품으로</Link><div className="detail-grid"><ProductImage product={product} className="detail-art"/><div className="detail-content"><div className="detail-tags"><span className="category-label">{product.category}</span><span className={`status-pill inline status-${product.status}`}>{STATUS_LABELS[product.status]}</span></div><h1>{product.title}</h1><p className="detail-price">{formatPrice(product.price, product.type)}</p><div className="detail-facts"><div><MapPin size={18}/><span>거래 희망 장소</span><strong>{product.location}</strong></div><div><CalendarDays size={18}/><span>등록일</span><strong>{formatDate(product.created_at)}</strong></div></div><div className="seller-profile"><span className="seller-avatar"><UserRound size={23}/></span><div><small>판매자</small><strong>{product.seller_nickname}</strong></div><span className="seller-note"><ShieldCheck size={15}/> 학교 사용자</span></div><div className="detail-description"><h2>상품 설명</h2><p>{product.description}</p></div>{owner ? <div className="detail-actions"><Link className="btn btn-outline" to={`/products/${id}/edit`}><Pencil size={17}/> 수정하기</Link><button className="btn btn-danger" disabled={busy} onClick={remove}><Trash2 size={17}/> {busy ? '삭제 중...' : '삭제하기'}</button></div> : <div className="detail-message"><ShieldCheck size={20}/><span>교내에서 직접 만나 물품 상태를 확인한 뒤 거래하세요. 개인정보 및 결제 정보는 신중하게 공유하세요.</span></div>}{error && <div className="alert error">{error}</div>}</div></div></div>;
}
