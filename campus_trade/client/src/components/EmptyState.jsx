import { Link } from 'react-router-dom';
import { PackageSearch } from 'lucide-react';
export default function EmptyState({ title = '아직 등록된 상품이 없어요', description = '첫 번째 상품을 올려 보세요!', action = true }) {
  return <div className="empty-state"><span className="empty-icon"><PackageSearch size={30}/></span><h3>{title}</h3><p>{description}</p>{action && <Link to="/products/new" className="btn btn-primary">상품 등록하기</Link>}</div>;
}
