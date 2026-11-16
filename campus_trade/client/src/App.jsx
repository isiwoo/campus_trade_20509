import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext.jsx';
import Layout from './components/Layout.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import ProductDetail from './pages/ProductDetail.jsx';
import ProductForm from './pages/ProductForm.jsx';
import MyPage from './pages/MyPage.jsx';
import Sellers from './pages/Sellers.jsx';
import NotFound from './pages/NotFound.jsx';

function Protected({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <div className="loading-message">회원 정보를 확인하는 중...</div>;
  return user ? children : <Navigate to="/login" state={{ from: location.pathname }} replace />;
}

export default function App() {
  return <Routes>
    <Route element={<Layout />}>
      <Route index element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/products/new" element={<Protected><ProductForm /></Protected>} />
      <Route path="/products/:id" element={<ProductDetail />} />
      <Route path="/products/:id/edit" element={<Protected><ProductForm /></Protected>} />
      <Route path="/mypage" element={<Protected><MyPage /></Protected>} />
      <Route path="/sellers" element={<Sellers />} />
      <Route path="*" element={<NotFound />} />
    </Route>
  </Routes>;
}
