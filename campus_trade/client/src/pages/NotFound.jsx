import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
export default function NotFound() {
  return <div className="container not-found"><span>404</span><h1>앗, 찾는 페이지가 없어요!</h1><p>주소를 다시 확인하거나 마켓으로 돌아가 보세요.</p><Link className="btn btn-primary" to="/"><ArrowLeft size={18}/> 마켓으로 돌아가기</Link></div>;
}
