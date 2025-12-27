import { useState, useEffect } from "react";
import { X, AlertCircle, CheckCircle, AlertTriangle, Info } from "lucide-react";
import { toast, getToasts } from "@/lib/toast";

interface Toast {
  id: string;
  type: "success" | "error" | "warning" | "info";
  message: string;
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>(getToasts());

  useEffect(() => {
    const unsubscribe = toast.subscribe(setToasts);
    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <div className="fixed bottom-0 right-0 z-50 p-4 space-y-2 max-w-md">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onClose={() => toast.remove(t.id)} />
      ))}
    </div>
  );
}

interface ToastItemProps {
  toast: Toast;
  onClose: () => void;
}

function ToastItem({ toast: t, onClose }: ToastItemProps) {
  const bgColor = {
    success: "bg-green-50 border-green-200",
    error: "bg-red-50 border-red-200",
    warning: "bg-yellow-50 border-yellow-200",
    info: "bg-blue-50 border-blue-200",
  }[t.type];

  const textColor = {
    success: "text-green-800",
    error: "text-red-800",
    warning: "text-yellow-800",
    info: "text-blue-800",
  }[t.type];

  const icon = {
    success: <CheckCircle className="h-5 w-5 text-green-600" />,
    error: <AlertCircle className="h-5 w-5 text-red-600" />,
    warning: <AlertTriangle className="h-5 w-5 text-yellow-600" />,
    info: <Info className="h-5 w-5 text-blue-600" />,
  }[t.type];

  return (
    <div
      className={`${bgColor} border rounded-lg p-4 flex items-start gap-3 shadow-lg animate-slide-in`}
    >
      <div className="shrink-0">{icon}</div>
      <div className={`flex-1 ${textColor} text-sm`}>
        <p>{t.message}</p>
      </div>
      <button
        onClick={onClose}
        className="shrink-0 text-gray-400 hover:text-gray-600 transition"
      >
        <X className="h-5 w-5" />
      </button>
    </div>
  );
}
