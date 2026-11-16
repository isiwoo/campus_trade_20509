import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateProduct, validateProfile, parseId } from './validation.js';

const sampleProduct = { title: '중고 교과서', description: '밑줄이 조금 있습니다.', price: '1000', type: 'SELL', category: '서적', status: 'SELLING', location: '본관 1층' };

test('정상적인 상품 등록 검증', () => {
  const result = validateProduct(sampleProduct);
  assert.equal(result.error, undefined);
  assert.equal(result.value.price, 1000);
});

test('나눔 상품의 가격은 0원이어야 함', () => {
  assert.ok(validateProduct({ ...sampleProduct, type: 'FREE' }).error);
  assert.equal(validateProduct({ ...sampleProduct, type: 'FREE', price: '0' }).error, undefined);
});

test('음수/비정상적인 상품 ID 거부', () => {
  assert.ok(validateProduct({ ...sampleProduct, price: -1 }).error);
  assert.equal(parseId('-1'), null);
  assert.equal(parseId('abc'), null);
  assert.equal(parseId('12'), 12);
});

test('회원가입 필수 비밀번호 8자 이상', () => {
  const user = { email: 'student@example.com', nickname: '홍길동', phone_number: '010-1234-5678', entry_year: 2025, student_id: '20315', password: 'short' };
  assert.ok(validateProfile(user, { registration: true }).error);
  assert.equal(validateProfile({ ...user, password: 'securePass123!' }, { registration: true }).error, undefined);
});
