import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { ArrowRight, UserPlus } from 'lucide-react';
import { useAuth } from '../AuthContext.jsx';

const initial = { email: '', password: '', password_confirm: '', nickname: '', phone_number: '', entry_year: '2026', student_id: '' };
export default function Register() {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(initial);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  if (user) return <Navigate to="/" replace />;
  const field = name => e => setForm(prev => ({ ...prev, [name]: e.target.value }));
  async function submit(e) {
    e.preventDefault(); setError('');
    if (form.password !== form.password_confirm) { setError('비밀번호 확인이 일치하지 않습니다.'); return; }
    setBusy(true);
    try { await register(form); navigate('/', { replace: true }); }
    catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }
  return <div className="container form-page"><div className="form-heading center"><span className="section-kicker">JOIN OUR MARKET</span><div className="form-page-icon"><UserPlus size={25}/></div><h1>다시마켓 시작하기</h1><p>우리 학교만의 특별한 중고거래에 참여해 보세요.</p></div><div className="form-card narrow"><form className="form-stack" onSubmit={submit}><label>이메일 <span className="required">*</span><input type="email" autoComplete="email" placeholder="student@example.com" maxLength="100" required value={form.email} onChange={field('email')}/></label><div className="form-columns"><label>닉네임 <span className="required">*</span><input placeholder="2자 이상" minLength="2" maxLength="50" required value={form.nickname} onChange={field('nickname')}/></label><label>연락처 <span className="required">*</span><input placeholder="010-1234-5678" maxLength="20" required value={form.phone_number} onChange={field('phone_number')}/></label></div><div className="form-columns"><label>입학 연도 <span className="required">*</span><input type="number" min="2000" max="2100" required value={form.entry_year} onChange={field('entry_year')}/></label><label>학번 <span className="required">*</span><input placeholder="예: 20315" minLength="3" maxLength="10" required value={form.student_id} onChange={field('student_id')}/></label></div><label>비밀번호 <span className="required">*</span><input type="password" autoComplete="new-password" placeholder="8자 이상" minLength="8" maxLength="72" required value={form.password} onChange={field('password')}/><small className="help-text">비밀번호는 bcrypt로 암호화해 안전하게 저장돼요.</small></label><label>비밀번호 확인 <span className="required">*</span><input type="password" autoComplete="new-password" placeholder="다시 한 번 입력하세요" required value={form.password_confirm} onChange={field('password_confirm')}/></label>{error && <div role="alert" className="alert error">{error}</div>}<button type="submit" disabled={busy} className="btn btn-primary btn-block btn-large">{busy ? '가입 처리 중...' : '회원가입 완료'} <ArrowRight size={18}/></button></form><p className="auth-switch">이미 계정이 있나요? <Link to="/login">로그인하기</Link></p></div></div>;
}
