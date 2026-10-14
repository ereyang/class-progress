// 앱으로 설치할 수 있게 하는 최소한의 서비스 워커.
// 저장(캐시)은 하지 않고 항상 인터넷에서 최신 파일을 받는다.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', () => {});
