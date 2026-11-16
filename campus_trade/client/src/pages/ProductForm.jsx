import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ImagePlus, PackagePlus, X } from 'lucide-react';
import { api, CATEGORIES } from '../api.js';
import { useAuth } from '../AuthContext.jsx';

const empty = { title: '', description: '', price: '', type: 'SELL', category: '서적', status: 'SELLING', location: '' };
export default function ProductForm() {
  const { id } = useParams();
  const editing = Boolean(id);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(empty);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [oldImage, setOldImage] = useState('');
  const [removeImage, setRemoveImage] = useState(false);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(editing);
  const [error, setError] = useState('');
  useEffect(() => {
    if (!editing) return;
    let active = true;
    api(`/products/${id}`).then(data => {
      if (!active) return;
      const p = data.product;
      if (p.seller_id !== user?.id) { setError('본인이 작성한 상품만 수정할 수 있습니다.'); return; }
      setForm({ title: p.title, description: p.description, price: String(p.price), type: p.type, category: p.category, status: p.status, location: p.location });
      setOldImage(p.image_url || '');
    }).catch(err => { if (active) setError(err.message); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id, editing, user?.id]);
  useEffect(() => {
    if (!file) { setPreview(''); return; }
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);
  const field = name => e => setForm(prev => ({ ...prev, [name]: e.target.value }));
  function setType(value) { setForm(prev => ({ ...prev, type: value, price: value === 'FREE' ? '0' : prev.price === '0' ? '' : prev.price })); }
  async function submit(e) {
    e.preventDefault(); setError(''); setBusy(true);
    const data = new FormData();
    Object.entries(form).forEach(([key, value]) => data.append(key, value));
    if (file) data.append('image', file);
    if (removeImage) data.append('remove_image', 'true');
    try {
      const result = await api(editing ? `/products/${id}` : '/products', { method: editing ? 'PATCH' : 'POST', body: data });
      navigate(`/products/${result.id}`);
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }
  if (loading) return <div className="container loading-message">상품 정보를 불러오는 중...</div>;
  if (editing && error && !form.title) return <div className="container detail-error"><div className="alert error">{error}</div><Link to="/" className="btn btn-outline">돌아가기</Link></div>;
  return <div className="container form-page"><Link to={editing ? `/products/${id}` : '/'} className="back-link"><ArrowLeft size={17}/> 뒤로 가기</Link><div className="form-heading"><span className="section-kicker">YOUR NEXT STORY</span><h1>{editing ? '상품 정보 수정' : '새 물건 등록하기'} <span className="heading-star">✳</span></h1><p>물건의 상태와 특징을 자세히 알려 주면 더 좋은 거래로 이어져요.</p></div><div className="form-card wide"><form onSubmit={submit} className="form-stack"><div className="form-section-title"><PackagePlus size={20}/> 기본 정보</div><label>상품 이름 <span className="required">*</span><input maxLength="150" required placeholder="예: 고등학교 수학 참고서" value={form.title} onChange={field('title')}/></label><div className="form-columns"><label>카테고리 <span className="required">*</span><select value={form.category} onChange={field('category')}>{CATEGORIES.filter(x=>x!=='전체').map(x=><option key={x}>{x}</option>)}</select></label><label>거래 상태 <span className="required">*</span><select value={form.status} onChange={field('status')}><option value="SELLING">거래 가능</option><option value="RESERVED">예약 중</option><option value="COMPLETED">거래 완료</option></select></label></div><label>거래 방식 <span className="required">*</span><div className="type-switch"><button type="button" className={form.type==='SELL'?'selected':''} onClick={()=>setType('SELL')}>💰 중고 판매</button><button type="button" className={form.type==='FREE'?'selected':''} onClick={()=>setType('FREE')}>💛 무료 나눔</button></div></label><label>가격 (원) <span className="required">*</span><input type="number" min={form.type==='FREE'?'0':'1'} max="100000000" required disabled={form.type==='FREE'} placeholder="가격을 숫자로 입력하세요" value={form.price} onChange={field('price')}/></label><label>거래 장소 <span className="required">*</span><input required maxLength="100" placeholder="예: 본관 1층 중앙현관" value={form.location} onChange={field('location')}/></label><div className="form-section-title space-top"><ImagePlus size={20}/> 사진 및 상세 설명</div><label>상품 사진 <span className="optional">선택 · JPG, PNG, WEBP, GIF · 5MB 이하</span><div className="image-drop"><input id="product-image" type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={e=>{const selected=e.target.files?.[0]||null;setFile(selected);if(selected)setRemoveImage(false);}}/>{preview || (oldImage && !removeImage) ? <img src={preview || oldImage} alt="선택한 상품 사진 미리보기"/> : <div><ImagePlus size={34}/><strong>여기를 눌러 사진을 추가해 보세요</strong><small>사진을 넣으면 상품을 더 잘 소개할 수 있어요.</small></div>}</div></label>{(file || (oldImage && !removeImage)) && <button type="button" className="link-button image-remove" onClick={()=>{setFile(null);setRemoveImage(true);const input=document.getElementById('product-image');if(input)input.value='';}}><X size={16}/> 사진 제거</button>}<label>상품 설명 <span className="required">*</span><textarea required maxLength="5000" rows="6" placeholder="물건의 상태, 사용 기간, 구성품 등을 자세히 적어 주세요." value={form.description} onChange={field('description')}/></label>{error && <div className="alert error" role="alert">{error}</div>}<div className="form-footer"><p>정확한 정보를 올려 우리 학교의 건강한 거래 문화를 만들어요.</p><button type="submit" disabled={busy} className="btn btn-primary btn-large">{busy ? '저장 중...' : editing ? '수정 완료' : '상품 등록하기'} <ArrowRight size={18}/></button></div></form></div></div>;
}
