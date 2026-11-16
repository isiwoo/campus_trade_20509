export function isEmail(value) {
  return typeof value === 'string' && value.length <= 100 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function cleanString(value, maxLength) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength + 1) : '';
}

export function validateProfile(body, { registration = false } = {}) {
  const email = cleanString(body.email, 100).toLowerCase();
  const nickname = cleanString(body.nickname, 50);
  const phone_number = cleanString(body.phone_number, 20);
  const student_id = cleanString(body.student_id, 10);
  const entry_year = Number(body.entry_year);
  const password = body.password;
  if (!isEmail(email)) return { error: '올바른 이메일을 입력해 주세요.' };
  if (nickname.length < 2 || nickname.length > 50) return { error: '닉네임은 2~50자로 입력해 주세요.' };
  if (!/^[\d\-+ ]{8,20}$/.test(phone_number)) return { error: '연락처는 숫자와 하이픈을 포함해 8~20자로 입력해 주세요.' };
  if (!Number.isInteger(entry_year) || entry_year < 2000 || entry_year > 2100) return { error: '입학 연도를 올바르게 입력해 주세요.' };
  if (!/^[0-9-]{3,10}$/.test(student_id)) return { error: '학번은 숫자 또는 하이픈으로 3~10자 입력해 주세요.' };
  if (registration && (typeof password !== 'string' || password.length < 8 || password.length > 72)) {
    return { error: '비밀번호는 8~72자로 입력해 주세요.' };
  }
  if (!registration && password && (typeof password !== 'string' || password.length < 8 || password.length > 72)) {
    return { error: '새 비밀번호는 8~72자로 입력해 주세요.' };
  }
  return { value: { email, nickname, phone_number, student_id, entry_year } };
}

export const CATEGORIES = ['서적', '학용품', '교복', '전자기기', '기타'];
export const STATUSES = ['SELLING', 'RESERVED', 'COMPLETED'];

export function validateProduct(body) {
  const title = cleanString(body.title, 150);
  const description = cleanString(body.description, 5000);
  const location = cleanString(body.location, 100);
  const category = body.category;
  const type = body.type;
  const status = body.status || 'SELLING';
  const price = Number(body.price);
  if (!title || title.length > 150) return { error: '제목은 1~150자로 입력해 주세요.' };
  if (!description || description.length > 5000) return { error: '설명은 1~5000자로 입력해 주세요.' };
  if (!CATEGORIES.includes(category)) return { error: '올바른 카테고리를 선택해 주세요.' };
  if (!['SELL', 'FREE'].includes(type)) return { error: '올바른 거래 유형을 선택해 주세요.' };
  if (!STATUSES.includes(status)) return { error: '올바른 거래 상태를 선택해 주세요.' };
  if (!location || location.length > 100) return { error: '교내 거래 장소는 1~100자로 입력해 주세요.' };
  if (!Number.isSafeInteger(price) || price < 0 || price > 100000000) return { error: '가격은 0원~1억원 사이로 입력해 주세요.' };
  if ((type === 'FREE' && price !== 0) || (type === 'SELL' && price === 0)) {
    return { error: '나눔은 0원, 판매는 1원 이상이어야 합니다.' };
  }
  return { value: { title, description, location, category, type, status, price } };
}

export function parseId(raw) {
  const id = Number(raw);
  return /^\d+$/.test(String(raw)) && Number.isSafeInteger(id) && id > 0 ? id : null;
}
