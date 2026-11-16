import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';
import multer from 'multer';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pool from './db.js';
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32 || process.env.JWT_SECRET.includes('교체')) {
  console.error('❌ server/.env 파일에 안전한 JWT_SECRET(32자 이상)을 설정해 주세요.');
  process.exit(1);
}
if (!process.env.DB_NAME || !process.env.DB_USER) {
  console.error('❌ server/.env 파일에 DB_NAME, DB_USER 등을 설정해 주세요.');
  process.exit(1);
}

const app = express();
const root = path.dirname(fileURLToPath(import.meta.url));
app.disable('x-powered-by');
app.use(express.json({ limit: '200kb' }));
app.use(express.urlencoded({ extended: false, limit: '200kb' }));
app.use(cookieParser());
app.use('/uploads', express.static(path.join(root, 'uploads'), { fallthrough: false, maxAge: '1d' }));

app.get('/api/health', async (_req, res) => {
  await pool.query('SELECT 1');
  res.json({ ok: true });
});
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api', (_req, res) => res.status(404).json({ message: '존재하지 않는 API입니다.' }));

// Express 5는 async 라우트에서 발생한 오류를 자동으로 이 핸들러로 전달합니다.
app.use((error, _req, res, _next) => {
  if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ message: '이미지는 최대 5MB까지 업로드할 수 있습니다.' });
  }
  if (error instanceof multer.MulterError || error.message?.includes('파일만 업로드')) {
    return res.status(400).json({ message: error.message });
  }
  if (error.code === 'ER_NO_SUCH_TABLE' || error.code === 'ER_BAD_DB_ERROR') {
    return res.status(500).json({ message: '데이터베이스가 준비되지 않았습니다. server/sql/schema.sql을 실행해 주세요.' });
  }
  console.error(error);
  return res.status(500).json({ message: '서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.' });
});

const port = Number(process.env.PORT) || 5000;
try {
  await pool.query('SELECT 1');
  app.listen(port, () => console.log(`✅ API 서버: http://localhost:${port}`));
} catch (error) {
  console.error('❌ MySQL 연결 실패:', error.message);
  console.error('   server/.env와 MySQL 실행 상태를 확인해 주세요.');
  process.exit(1);
}
