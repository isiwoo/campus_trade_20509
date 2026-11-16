import { Router } from 'express';
import bcrypt from 'bcrypt';
import pool from '../db.js';
import { requireAuth, setLoginCookie, clearLoginCookie } from '../middleware/auth.js';
import { validateProfile } from '../validation.js';

const router = Router();
const PUBLIC_FIELDS = 'id, email, nickname, phone_number, entry_year, student_id, created_at';
const normalizeEmail = value => typeof value === 'string' ? value.trim().toLowerCase() : '';

function duplicateError(error, res) {
  if (error.code === 'ER_DUP_ENTRY') {
    res.status(409).json({ message: '이미 등록된 이메일 또는 연락처입니다.' });
    return true;
  }
  return false;
}

router.post('/register', async (req, res) => {
  const result = validateProfile(req.body || {}, { registration: true });
  if (result.error) return res.status(400).json({ message: result.error });
  const { email, nickname, phone_number, entry_year, student_id } = result.value;
  try {
    const hash = await bcrypt.hash(req.body.password, 12);
    const [insert] = await pool.execute(
      'INSERT INTO users (email, password, nickname, phone_number, entry_year, student_id) VALUES (?, ?, ?, ?, ?, ?)',
      [email, hash, nickname, phone_number, entry_year, student_id]
    );
    const [rows] = await pool.execute(`SELECT ${PUBLIC_FIELDS} FROM users WHERE id = ?`, [insert.insertId]);
    setLoginCookie(res, insert.insertId);
    return res.status(201).json({ message: '회원가입이 완료되었습니다.', user: rows[0] });
  } catch (error) {
    if (duplicateError(error, res)) return;
    throw error;
  }
});

router.post('/login', async (req, res) => {
  const email = normalizeEmail(req.body?.email);
  const password = req.body?.password;
  if (!email || typeof password !== 'string') return res.status(400).json({ message: '이메일과 비밀번호를 입력해 주세요.' });
  const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
  const user = rows[0];
  // 존재하지 않는 이메일과 틀린 비밀번호의 응답을 동일하게 처리합니다.
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: '이메일 또는 비밀번호가 올바르지 않습니다.' });
  }
  setLoginCookie(res, user.id);
  const { password: _hash, updated_at: _updatedAt, ...publicUser } = user;
  return res.json({ message: '로그인되었습니다.', user: publicUser });
});

router.post('/logout', (req, res) => {
  clearLoginCookie(res);
  res.json({ message: '로그아웃되었습니다.' });
});

router.get('/me', requireAuth, (req, res) => res.json({ user: req.user }));

router.patch('/me', requireAuth, async (req, res) => {
  const result = validateProfile(req.body || {});
  if (result.error) return res.status(400).json({ message: result.error });
  const { email, nickname, phone_number, entry_year, student_id } = result.value;
  let hash = null;
  if (req.body?.password) {
    if (typeof req.body?.current_password !== 'string') {
      return res.status(400).json({ message: '비밀번호 변경 시 현재 비밀번호를 입력해 주세요.' });
    }
    const [passwordRows] = await pool.execute('SELECT password FROM users WHERE id = ?', [req.user.id]);
    if (!passwordRows.length || !(await bcrypt.compare(req.body?.current_password, passwordRows[0].password))) {
      return res.status(403).json({ message: '현재 비밀번호가 일치하지 않습니다.' });
    }
    hash = await bcrypt.hash(req.body.password, 12);
  }
  try {
    if (hash) {
      await pool.execute(
        'UPDATE users SET email = ?, nickname = ?, phone_number = ?, entry_year = ?, student_id = ?, password = ? WHERE id = ?',
        [email, nickname, phone_number, entry_year, student_id, hash, req.user.id]
      );
    } else {
      await pool.execute(
        'UPDATE users SET email = ?, nickname = ?, phone_number = ?, entry_year = ?, student_id = ? WHERE id = ?',
        [email, nickname, phone_number, entry_year, student_id, req.user.id]
      );
    }
    const [rows] = await pool.execute(`SELECT ${PUBLIC_FIELDS} FROM users WHERE id = ?`, [req.user.id]);
    return res.json({ message: '프로필이 수정되었습니다.', user: rows[0] });
  } catch (error) {
    if (duplicateError(error, res)) return;
    throw error;
  }
});

router.delete('/me', requireAuth, async (req, res) => {
  if (typeof req.body?.password !== 'string') return res.status(400).json({ message: '회원 탈퇴를 위해 비밀번호를 입력해 주세요.' });
  const [rows] = await pool.execute('SELECT password FROM users WHERE id = ?', [req.user.id]);
  if (!rows.length || !(await bcrypt.compare(req.body?.password, rows[0].password))) {
    return res.status(403).json({ message: '비밀번호가 일치하지 않습니다.' });
  }
  await pool.execute('DELETE FROM users WHERE id = ?', [req.user.id]);
  clearLoginCookie(res);
  res.json({ message: '회원 탈퇴가 완료되었습니다.' });
});

export default router;
