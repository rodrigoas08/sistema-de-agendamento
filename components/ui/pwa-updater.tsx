"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { RefreshCw } from "lucide-react";

/**
 * Componente responsável por detectar atualizações do Service Worker (PWA)
 * e notificar o usuário com um toast interativo via Sonner.
 *
 * Quando um novo SW é detectado no estado `waiting`, exibe um toast persistente
 * com um botão de "Atualizar". Ao clicar, envia a mensagem `SKIP_WAITING` ao novo
 * SW para que ele tome o controle imediatamente e força o reload da página.
 *
 * @returns {null} Não renderiza nenhum elemento visual diretamente.
 */
export function PWAUpdater(): null {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    /**
     * Envia a mensagem para o Service Worker em espera assumir o controle
     * e recarrega a página para aplicar a nova versão.
     *
     * @param {ServiceWorker} waitingServiceWorker - O service worker em estado de espera.
     */
    function activateNewServiceWorker(waitingServiceWorker: ServiceWorker): void {
      waitingServiceWorker.addEventListener("statechange", (event) => {
        const updatedWorker = event.target as ServiceWorker;
        if (updatedWorker.state === "activated") {
          window.location.reload();
        }
      });
      waitingServiceWorker.postMessage({ type: "SKIP_WAITING" });
    }

    /**
     * Exibe o toast de atualização disponível com a ação de refresh.
     *
     * @param {ServiceWorker} waitingServiceWorker - O SW que está aguardando para ser ativado.
     */
    function showUpdateToast(waitingServiceWorker: ServiceWorker): void {
      toast("Nova versão disponível!", {
        description: "Atualize para aproveitar as últimas melhorias.",
        duration: Infinity,
        icon: <RefreshCw className="h-4 w-4" />,
        action: {
          label: "Atualizar agora",
          onClick: () => activateNewServiceWorker(waitingServiceWorker),
        },
      });
    }

    navigator.serviceWorker.ready.then((registration) => {
      // Caso já haja um SW em espera ao carregar a página
      if (registration.waiting) {
        showUpdateToast(registration.waiting);
        return;
      }

      // Detecta quando um novo SW é encontrado durante a sessão
      registration.addEventListener("updatefound", () => {
        const installingWorker = registration.installing;
        if (!installingWorker) return;

        installingWorker.addEventListener("statechange", () => {
          // Quando o novo SW termina de instalar e entra em estado de espera
          if (
            installingWorker.state === "installed" &&
            navigator.serviceWorker.controller
          ) {
            showUpdateToast(installingWorker);
          }
        });
      });
    });
  }, []);

  return null;
}
