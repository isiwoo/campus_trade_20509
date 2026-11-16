import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, BarChart3, Package, ShieldCheck, UserRound } from 'lucide-react';
import { api, formatDate } from '../api.js';

export default function Sellers() {
  const [sellers, setSellers] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  useEffect(()=>{ api('/products/sellers').then(data=>setSellers(data.sellers)).catch(err=>setError(err.message)).finally(()=>setLoading(false)); }, []);
  return <div className="container sellers-page"><Link to="/" className="back-link"><ArrowLeft size={17}/> 마켓으로 돌아가기</Link><div className="page-top"><div><span className="section-kicker">OUR COMMUNITY</span><h1>판매자 현황 <span className="heading-star">✳</span></h1><p>우리 학교에서 물건을 나누고 있는 친구들을 만나 보세요.</p></div><span className="heading-deco"><BarChart3 size={35}/></span></div><div className="join-explainer"><ShieldCheck size={22}/><div><strong>수행평가 필수 JOIN 조회 기능</strong><p>MySQL <code>users</code> 테이블과 <code>products</code> 테이블을 <code>INNER JOIN</code>하여 판매자별 상품 개수를 보여주는 화면입니다.</p></div></div>{error && <div className="alert error">{error}</div>}{loading ? <div className="loading-message">판매자 정보를 불러오는 중...</div> : !error && !sellers.length ? <div className="empty-state"><Package size={30}/><h3>아직 상품을 등록한 판매자가 없어요</h3><p>상품을 등록하면 이 화면에 자동으로 표시됩니다.</p><Link className="btn btn-primary" to="/products/new">상품 등록하기</Link></div> : !error && <div className="seller-list"><div className="seller-list-head"><span>판매자</span><span>전체 상품</span><span>거래 가능</span><span>최근 등록</span></div>{sellers.map((s,index)=><div className="seller-list-item" key={s.seller_id}><div className="seller-name"><span className="seller-rank">{index + 1}</span><span className="seller-avatar"><UserRound size={19}/></span><strong>{s.seller_nickname}</strong></div><strong>{Number(s.total_products)}개</strong><span className="selling-count">{Number(s.selling_products)}개</span><span className="seller-date">{formatDate(s.latest_post_at)}</span></div>)}</div>}<p className="join-footnote">* 판매 글을 한 개 이상 등록한 회원만 표시됩니다. 회원 연락처 등 개인정보는 공개하지 않습니다.</p></div>;
}
