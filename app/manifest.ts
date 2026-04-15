import type { MetadataRoute } from "next";

/**
 * Define o Web App Manifest da aplicação.
 * Este arquivo é detectado automaticamente pelo Next.js para gerar o manifest.json.
 * 
 * @returns {MetadataRoute.Manifest} Objeto de configuração do manifesto.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Seu Negócio",
    short_name: "Seu Negócio",
    description: "Sistema de Agendamento Profissional",
    start_url: "/",
    display: "standalone",
    background_color: "#000000",
    theme_color: "#EF4444",
    icons: [
      {
        src: "/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
