-- 1. MySQL에서 자신의 데이터베이스(예: school_market_본인학번)를 먼저 생성하거나 선택합니다.
--    CREATE DATABASE school_market_본인학번 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
--    USE school_market_본인학번;
-- 2. 아래 CREATE TABLE 문들을 실행합니다.
--    이미 테이블이 있는 경우 IF NOT EXISTS 때문에 기존 구조가 변경되지는 않습니다.
USE school_market;
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL COMMENT 'bcrypt 해시만 저장',
  nickname VARCHAR(50) NOT NULL,
  phone_number VARCHAR(20) NOT NULL UNIQUE,
  entry_year INT NOT NULL,
  student_id VARCHAR(10) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(150) NOT NULL,
  description TEXT NOT NULL,
  price INT NOT NULL DEFAULT 0,
  type VARCHAR(10) NOT NULL DEFAULT 'SELL',
  category VARCHAR(50) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'SELLING',
  location VARCHAR(100) NOT NULL,
  image_url VARCHAR(255) DEFAULT NULL,
  seller_id INT NOT NULL,
  buyer_id INT DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_products_seller (seller_id),
  INDEX idx_products_created (created_at),
  CONSTRAINT fk_products_seller FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_products_buyer FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT chk_products_price CHECK (price >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 필수 JOIN 기능 확인용 SQL (웹사이트에서는 '판매자 현황' 메뉴로 실행됩니다.)
-- SELECT u.id, u.nickname, COUNT(p.id) AS total_products
-- FROM users u INNER JOIN products p ON p.seller_id = u.id
-- GROUP BY u.id, u.nickname;
