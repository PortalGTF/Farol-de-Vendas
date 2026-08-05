// Service worker: só cacheia o "esqueleto" do app (HTML/ícones/manifest).
// Os dados da planilha (Google Sheets) NUNCA são cacheados aqui —
// sempre buscados direto na rede, pra nunca mostrar dado velho.
const CACHE_NAME = "farol-shell-v1";
const SHELL_FILES = ["./index.html", "./manifest.json", "./icon-192.png", "./icon-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_FILES))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  // Só intercepta arquivos do próprio app (mesma origem).
  // Chamadas pro Google Sheets (outra origem) passam direto pra rede.
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(event.request).then((cached) => cached || fetch(event.request))
    );
  }
});
