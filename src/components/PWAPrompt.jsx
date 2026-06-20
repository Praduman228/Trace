import React from "react";
import { useRegisterSW } from "virtual:pwa-register/react";
import { RefreshCw, WifiOff, X } from "lucide-react";

const PWAPrompt = () => {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log("SW Registered: ", r);
    },
    onRegisterError(error) {
      console.error("SW registration error: ", error);
    },
  });

  const close = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  if (!offlineReady && !needRefresh) return null;

  return (
    <div className="fixed bottom-6 right-6 left-6 sm:left-auto sm:w-96 z-[999] animate-slide-in">
      <div className="bg-white/80 backdrop-blur-xl border border-white/30 rounded-2xl p-4 shadow-2xl flex flex-col gap-3">
        <div className="flex items-start gap-3">
          <div className={`p-2.5 rounded-xl shrink-0 ${
            needRefresh 
              ? "bg-purple-100 text-purple-600 animate-pulse" 
              : "bg-green-100 text-green-600"
          }`}>
            {needRefresh ? <RefreshCw size={20} /> : <WifiOff size={20} />}
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-gray-800 text-sm">
              {needRefresh ? "Update Available" : "Offline Ready"}
            </h4>
            <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
              {needRefresh 
                ? "A new version of Trace is available. Reload to get the latest features." 
                : "Trace is cached and ready to work offline."}
            </p>
          </div>

          <button 
            onClick={close}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100/50 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {needRefresh && (
          <button
            onClick={() => updateServiceWorker(true)}
            className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2"
          >
            <RefreshCw size={14} className="animate-spin-slow" />
            Reload & Update
          </button>
        )}
      </div>
    </div>
  );
};

export default PWAPrompt;
