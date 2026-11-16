import jwt from 'jsonwebtoken';
import pool from '../db.js';

export const COOKIE_NAME = 'school_market_token';
export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
  maxAge: 7 * 24 * 60 * 60 * 1000
};

export function setLoginCookie(res, userId) {
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.cookie(COOKIE_NAME, token, COOKIE_OPTIONS);
}

export function clearLoginCookie(res) {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: COOKIE_OPTIONS.httpOnly,
    secure: COOKIE_OPTIONS.secure,
    sameSite: COOKIE_OPTIONS.sameSite,
    path: COOKIE_OPTIONS.path
  });
}

export async function requireAuth(req, res, next) {
  try {
    const token = req.cookies?.[COOKIE_NAME];
    if (!token) return res.status(401).json({ message: '로그인이 필요합니다.' });
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (!Number.isSafeInteger(payload.id) || payload.id <= 0) {
      return res.status(401).json({ message: '유효하지 않은 로그인 정보입니다.' });
    }
    const [rows] = await pool.execute(
      'SELECT id, email, nickname, phone_number, entry_year, student_id, created_at FROM users WHERE id = ?',
      [payload.id]
    );
    if (!rows.length) {
      clearLoginCookie(res);
      return res.status(401).json({ message: '탈퇴했거나 존재하지 않는 계정입니다.' });
    }
    req.user = rows[0];
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError') {
      clearLoginCookie(res);
      return res.status(401).json({ message: '로그인 시간이 만료되었습니다. 다시 로그인해 주세요.' });
    }
    next(error);
  }
}
