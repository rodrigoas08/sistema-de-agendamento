/// <reference lib="webworker" />
import { installSerwist } from "@serwist/sw";
import { type PrecacheEntry, type SerwistGlobalConfig } from "serwist";
import { StaleWhileRevalidate, CacheFirst } from "serwist";
import { ExpirationPlugin } from "serwist";

declare const self: ServiceWorkerGlobalScope & SerwistGlobalConfig & {
  __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
};

/**
 * Configuração e instalação do Service Worker com Serwist.
 *
 * - `skipWaiting: true` → O novo SW toma controle assim que instalado.
 * - `clientsClaim: true` → O SW passa a controlar todas as abas abertas imediatamente.
 * - Páginas navegadas são cacheadas com StaleWhileRevalidate (sempre atualiza em background).
 * - Assets estáticos (imagens, fontes, JS, CSS) são cacheados com CacheFirst (performance).
 *
 * @see https://serwist.pages.dev/docs/sw/install-serwist
 */
installSerwist({
  precacheEntries: self.__SW_MANIFEST as PrecacheEntry[],
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    {
      // Cache de navegação: páginas HTML
      matcher: ({ request }) => request.mode === "navigate",
      handler: new StaleWhileRevalidate({
        cacheName: "pages-cache",
        plugins: [
          new ExpirationPlugin({ maxEntries: 64, maxAgeSeconds: 24 * 60 * 60 }),
        ],
      }),
    },
    {
      // Cache de assets estáticos: imagens, fontes, scripts e estilos
      matcher: ({ request }) =>
        ["style", "script", "worker", "font", "image"].includes(
          request.destination
        ),
      handler: new CacheFirst({
        cacheName: "static-assets-cache",
        plugins: [
          new ExpirationPlugin({
            maxEntries: 128,
            maxAgeSeconds: 30 * 24 * 60 * 60,
          }),
        ],
      }),
    },
  ],
});

