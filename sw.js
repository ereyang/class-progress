// 앱으로 설치할 수 있게 하는 최소한의 서비스 워커.
// 화면(index.html)을 열 때마다 서버에 새 버전이 있는지 확인해서, 고친 내용이 바로 보이게 한다.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', e => {
  if (e.request.mode === 'navigate') {
    e.respondWith(fetch(e.request, { cache: 'no-cache' }).catch(() => fetch(e.request)));
  }
});
