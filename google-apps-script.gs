/**
 * 수업 진도표 – 구글 시트 저장소
 *
 * 진도표(index.html)가 보낸 내용을 이 시트의 'data' 탭에 저장하고,
 * 저장된 최신 내용을 돌려준다.
 * 두 기기에서 고친 내용은 항목(수업·차시 설명)마다 더 최근에 고친 쪽을 골라 합친다.
 *
 * 설정 방법은 구글시트_설정.md 를 보세요.
 */

const SHEET_NAME = 'data';
const CHUNK = 40000; // 셀 하나에 5만 자까지라 나눠서 저장

function emptyData_() {
  return { app: 'jindo', version: 2, updatedAt: null, lessons: {}, plan: {} };
}

// 저장된 내용 보기 (브라우저로 주소를 열어 확인할 때)
function doGet() {
  return json_(read_());
}

// 진도표가 보낸 내용과 합쳐서 저장하고, 합친 결과를 돌려줌
function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const incoming = JSON.parse(e.postData.contents);
    if (!incoming || incoming.app !== 'jindo') return json_({ error: 'not jindo data' });
    const merged = merge_(read_(), incoming);
    write_(merged);
    return json_(merged);
  } finally {
    lock.releaseLock();
  }
}

function merge_(a, b) {
  const out = emptyData_();
  ['lessons', 'plan'].forEach(function (k) {
    const A = a[k] || {}, B = b[k] || {};
    const ids = Object.keys(A).concat(Object.keys(B));
    ids.forEach(function (id) {
      const x = A[id], y = B[id];
      out[k][id] = !x ? y : !y ? x : ((y.t || 0) > (x.t || 0) ? y : x);
    });
  });
  out.updatedAt = [a.updatedAt, b.updatedAt].filter(Boolean).sort().pop() || null;
  return out;
}

function sheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  return ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
}

function read_() {
  const sh = sheet_();
  const n = sh.getLastRow();
  if (!n) return emptyData_();
  // 각 칸 앞의 '~' 는 수식(=…)으로 읽히지 않게 붙인 표시
  const s = sh.getRange(1, 1, n, 1).getValues().map(function (r) { return String(r[0]).slice(1); }).join('');
  try {
    return JSON.parse(s);
  } catch (err) {
    return emptyData_();
  }
}

function write_(data) {
  const s = JSON.stringify(data);
  const rows = [];
  for (let i = 0; i < s.length; i += CHUNK) rows.push(['~' + s.slice(i, i + CHUNK)]);
  const sh = sheet_();
  sh.clearContents();
  sh.getRange(1, 1, rows.length, 1).setValues(rows);
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
