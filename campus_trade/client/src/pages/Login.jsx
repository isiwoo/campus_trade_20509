import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, LockKeyhole, Mail } from 'lucide-react';
import { useAuth } from '../AuthContext.jsx';

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  if (user) return <Navigate to="/" replace />;
  async function submit(e) {
    e.preventDefault(); setBusy(true); setError('');
    try { await login(form); navigate(location.state?.from || '/', { replace: true }); }
    catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }
  return <div className="auth-page container"><div className="auth-deco"><div className="auth-illustration">🎒<span>✦</span></div><p>우리 학교의 작은 물건들이<br/>새로운 주인을 기다리고 있어요.</p></div><div className="auth-panel"><span className="section-kicker">WELCOME BACK</span><h1>다시 만나서 반가워요!</h1><p className="subtext">계속하려면 계정에 로그인해 주세요.</p><form onSubmit={submit} className="form-stack"><label>이메일<div className="input-icon"><Mail size={18}/><input type="email" required maxLength="100" placeholder="student@example.com" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></div></label><label>비밀번호<div className="input-icon"><LockKeyhole size={18}/><input type="password" required placeholder="비밀번호를 입력하세요" value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/></div></label>{error && <div role="alert" className="alert error">{error}</div>}<button disabled={busy} className="btn btn-primary btn-block btn-large" type="submit">{busy ? '로그인 중...' : '로그인'} <ArrowRight size={18}/></button></form><p className="auth-switch">아직 계정이 없나요? <Link to="/register">회원가입하기</Link></p></div></div>;
}
