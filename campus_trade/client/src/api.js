export async function api(endpoint, options = {}) {
  const { body, headers, ...rest } = options;
  const isFormData = body instanceof FormData;
  let response;
  try {
    response = await fetch(`/api${endpoint}`, {
      ...rest,
      credentials: 'include',
      headers: {
        ...(!isFormData && body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...headers
      },
      ...(body !== undefined ? { body: isFormData ? body : JSON.stringify(body) } : {})
    });
  } catch {
    throw new Error('서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해 주세요.');
  }
  let data;
  try { data = await response.json(); } catch { data = {}; }
  if (!response.ok) throw new Error(data.message || '요청을 처리하지 못했습니다.');
  return data;
}

export const formatPrice = (price, type) => type === 'FREE' || Number(price) === 0
  ? '무료 나눔' : `${Number(price || 0).toLocaleString('ko-KR')}원`;

export const formatDate = value => value ? new Date(value).toLocaleDateString('ko-KR', { year: 'numeric', month: 'short', day: 'numeric' }) : '-';

export const CATEGORIES = ['전체', '서적', '학용품', '교복', '전자기기', '기타'];
export const STATUS_LABELS = { SELLING: '거래 가능', RESERVED: '예약 중', COMPLETED: '거래 완료' };
export const CATEGORY_ICONS = { '서적': '📚', '학용품': '✏️', '교복': '👕', '전자기기': '🎧', '기타': '📦' };
