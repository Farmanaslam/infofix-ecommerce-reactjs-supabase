import { useEffect, useState } from "react";
import { Download } from "lucide-react";

let deferredPrompt: any = null;

export function InstallPWA() {
  const [canInstall, setCanInstall] = useState(false);
  const [isLocalhost, setIsLocalhost] = useState(false);

  useEffect(() => {
    // Check if we're on localhost for dev testing
    const onLocalhost =
      location.hostname === "localhost" || location.hostname === "127.0.0.1";
    setIsLocalhost(onLocalhost);

    // This event fires when Chrome decides app is installable
    // On localhost it may not fire — that's why we show fallback below
    const handler = (e: any) => {
      e.preventDefault();
      deferredPrompt = e;
      setCanInstall(true);
      console.log("✅ beforeinstallprompt fired — install button ready");
    };

    window.addEventListener("beforeinstallprompt", handler);

    // Also check if already installed — hide button if so
    window.addEventListener("appinstalled", () => {
      deferredPrompt = null;
      setCanInstall(false);
      console.log("✅ PWA was installed");
    });

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const installApp = async () => {
    if (!deferredPrompt) {
      // On localhost: guide user to install manually via address bar
      alert(
        "To install:\n\n" +
          "Chrome Desktop → Click the ⊕ icon in the address bar\n" +
          "Chrome Mobile → Tap the 3-dot menu → 'Add to Home Screen'\n\n" +
          "Note: Auto-install prompt appears on deployed (HTTPS) site.",
      );
      return;
    }
    deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === "accepted") {
      console.log("✅ PWA installed!");
    }
    deferredPrompt = null;
    setCanInstall(false);
  };

  // On production: only show when Chrome says installable
  // On localhost: always show so you can test the UI
  if (!canInstall && !isLocalhost) return null;

  return (
    <button
      onClick={installApp}
      className="flex items-center gap-1.5 hover:text-white transition-colors duration-150 cursor-pointer"
    >
      <Download className="w-3 h-3 text-orange-400" />
      Download App
    </button>
  );
}
