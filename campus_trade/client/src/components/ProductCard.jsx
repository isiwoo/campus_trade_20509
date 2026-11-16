import { Link } from 'react-router-dom';
import { ArrowUpRight, MapPin } from 'lucide-react';
import { CATEGORY_ICONS, formatPrice, STATUS_LABELS } from '../api.js';

export function ProductImage({ product, className = '' }) {
  return <div className={`product-art ${className} art-${product.category === '전자기기' ? 'tech' : product.category === '서적' ? 'books' : product.category === '교복' ? 'clothes' : product.category === '학용품' ? 'stationery' : 'etc'}`}>
    {product.image_url ? <img src={product.image_url} alt={`${product.title} 상품 사진`} loading="lazy"/> : <div className="product-emoji" aria-hidden="true">{CATEGORY_ICONS[product.category] || '📦'}</div>}
  </div>;
}

export default function ProductCard({ product }) {
  return <Link className="product-card" to={`/products/${product.id}`}>
    <div className="product-image-wrap">
      <ProductImage product={product} />
      <span className={`status-pill status-${product.status}`}>{STATUS_LABELS[product.status]}</span>
      <span className="image-arrow"><ArrowUpRight size={17}/></span>
    </div>
    <div className="product-info">
      <div className="product-meta"><span>{product.category}</span><span className="meta-dot">·</span><span>{product.seller_nickname}</span></div>
      <h3>{product.title}</h3>
      <strong className={product.type === 'FREE' ? 'price-free' : ''}>{formatPrice(product.price, product.type)}</strong>
      <p className="card-location"><MapPin size={14}/> {product.location}</p>
    </div>
  </Link>;
}
