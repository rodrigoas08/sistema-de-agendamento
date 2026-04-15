import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  // Arquivo fonte do service worker (criado anteriormente em app/sw.ts)
  swSrc: "app/sw.ts",
  // Destino do service worker compilado na pasta public
  swDest: "public/sw.js",
  // Desativa o PWA em desenvolvimento para evitar cache indesejado durante o dev
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  // Necessário para silenciar o aviso do Next.js 16 sobre Turbopack + Webpack.
  // O @serwist/next injeta uma configuração webpack; como o PWA está
  // desativado em desenvolvimento (disable: process.env.NODE_ENV === "development"),
  // o turbopack vazio aqui apenas evita o erro no build de produção.
  turbopack: {},
};


export default withSerwist(nextConfig);
