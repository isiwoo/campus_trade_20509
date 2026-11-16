import { Router } from 'express';
import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import pool from '../db.js';
import { requireAuth } from '../middleware/auth.js';
import { CATEGORIES, STATUSES, validateProduct, parseId } from '../validation.js';

const router = Router();
const uploadsDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../uploads');
const extensionByMime = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif'
};
const upload = multer({
  storage: multer.diskStorage({
    destination: uploadsDir,
    filename: (_req, file, cb) => cb(null, `${randomUUID()}${extensionByMime[file.mimetype] || '.bin'}`)
  }),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (!extensionByMime[file.mimetype]) return cb(new Error('JPG, PNG, WEBP, GIF 파일만 업로드할 수 있습니다.'));
    cb(null, true);
  }
});

async function removeImage(imageUrl) {
  if (typeof imageUrl !== 'string' || !/^\/uploads\/[a-f0-9-]+\.(jpg|png|webp|gif)$/.test(imageUrl)) return;
  try {
    await fs.unlink(path.join(uploadsDir, path.basename(imageUrl)));
  } catch (error) {
    if (error.code !== 'ENOENT') console.error('이미지 정리 실패:', error);
  }
}

const joinedSelect = `SELECT p.id, p.title, p.description, p.price, p.type, p.category,
 p.status, p.location, p.image_url, p.seller_id, p.created_at, p.updated_at,
 u.nickname AS seller_nickname
 FROM products AS p INNER JOIN users AS u ON p.seller_id = u.id`;

router.get('/', async (req, res) => {
  const clauses = [];
  const params = [];
  const category = req.query.category;
  const status = req.query.status;
  const q = typeof req.query.q === 'string' ? req.query.q.trim().slice(0, 100) : '';
  if (typeof category === 'string' && CATEGORIES.includes(category)) {
    clauses.push('p.category = ?'); params.push(category);
  }
  if (typeof status === 'string' && STATUSES.includes(status)) {
    clauses.push('p.status = ?'); params.push(status);
  }
  if (q) {
    clauses.push('(p.title LIKE ? OR p.description LIKE ?)');
    params.push(`%${q}%`, `%${q}%`);
  }
  const sql = joinedSelect + (clauses.length ? ` WHERE ${clauses.join(' AND ')}` : '') + ' ORDER BY p.created_at DESC, p.id DESC LIMIT 100';
  const [rows] = await pool.query(sql, params);
  res.json({ products: rows });
});

// 별도의 JOIN 결과 조회 화면: 판매자가 올린 상품 개수 집계
router.get('/sellers', async (_req, res) => {
  const [rows] = await pool.execute(`
    SELECT u.id AS seller_id, u.nickname AS seller_nickname,
           COUNT(p.id) AS total_products,
           SUM(CASE WHEN p.status = 'SELLING' THEN 1 ELSE 0 END) AS selling_products,
           MAX(p.created_at) AS latest_post_at
    FROM users AS u
    INNER JOIN products AS p ON p.seller_id = u.id
    GROUP BY u.id, u.nickname
    ORDER BY total_products DESC, latest_post_at DESC
  `);
  res.json({ sellers: rows });
});

router.get('/:id', async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ message: '올바른 상품 번호가 아닙니다.' });
  const [rows] = await pool.execute(`${joinedSelect} WHERE p.id = ?`, [id]);
  if (!rows.length) return res.status(404).json({ message: '상품을 찾을 수 없습니다.' });
  res.json({ product: rows[0] });
});

router.post('/', requireAuth, upload.single('image'), async (req, res) => {
  const result = validateProduct(req.body);
  if (result.error) {
    if (req.file) await removeImage(`/uploads/${req.file.filename}`);
    return res.status(400).json({ message: result.error });
  }
  const { title, description, price, type, category, status, location } = result.value;
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
  try {
    const [insert] = await pool.execute(
      'INSERT INTO products (title, description, price, type, category, status, location, image_url, seller_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [title, description, price, type, category, status, location, imageUrl, req.user.id]
    );
    return res.status(201).json({ message: '상품이 등록되었습니다.', id: insert.insertId });
  } catch (error) {
    await removeImage(imageUrl);
    throw error;
  }
});

router.patch('/:id', requireAuth, upload.single('image'), async (req, res) => {
  const id = parseId(req.params.id);
  const result = validateProduct(req.body);
  const newImage = req.file ? `/uploads/${req.file.filename}` : null;
  if (!id || result.error) {
    await removeImage(newImage);
    return res.status(400).json({ message: result.error || '올바른 상품 번호가 아닙니다.' });
  }
  const { title, description, price, type, category, status, location } = result.value;
  try {
    const [rows] = await pool.execute('SELECT seller_id, image_url FROM products WHERE id = ?', [id]);
    if (!rows.length) {
      await removeImage(newImage);
      return res.status(404).json({ message: '상품을 찾을 수 없습니다.' });
    }
    if (rows[0].seller_id !== req.user.id) {
      await removeImage(newImage);
      return res.status(403).json({ message: '본인이 작성한 상품만 수정할 수 있습니다.' });
    }
    const oldImage = rows[0].image_url;
    const imageUrl = newImage || (req.body.remove_image === 'true' ? null : oldImage);
    // 동시 수정/삭제 시에도 SQL 조건에서 소유권을 다시 확인합니다.
    const [updated] = await pool.execute(
      'UPDATE products SET title=?, description=?, price=?, type=?, category=?, status=?, location=?, image_url=? WHERE id=? AND seller_id=?',
      [title, description, price, type, category, status, location, imageUrl, id, req.user.id]
    );
    if (!updated.affectedRows) {
      await removeImage(newImage);
      return res.status(404).json({ message: '상품이 삭제되어 수정할 수 없습니다.' });
    }
    if (oldImage && oldImage !== imageUrl) await removeImage(oldImage);
    return res.json({ message: '상품이 수정되었습니다.', id });
  } catch (error) {
    await removeImage(newImage);
    throw error;
  }
});

router.delete('/:id', requireAuth, async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ message: '올바른 상품 번호가 아닙니다.' });
  const [rows] = await pool.execute('SELECT seller_id, image_url FROM products WHERE id = ?', [id]);
  if (!rows.length) return res.status(404).json({ message: '상품을 찾을 수 없습니다.' });
  if (rows[0].seller_id !== req.user.id) {
    return res.status(403).json({ message: '본인이 작성한 상품만 삭제할 수 있습니다.' });
  }
  const [deleted] = await pool.execute('DELETE FROM products WHERE id = ? AND seller_id = ?', [id, req.user.id]);
  if (!deleted.affectedRows) return res.status(404).json({ message: '상품이 이미 삭제되었습니다.' });
  await removeImage(rows[0].image_url);
  return res.json({ message: '상품이 삭제되었습니다.' });
});

export default router;
