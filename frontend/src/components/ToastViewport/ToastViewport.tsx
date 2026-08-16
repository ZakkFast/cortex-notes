import "./ToastViewport.css";

export type Toast = {
  id: number;
  message: string;
  tone: "neutral" | "error";
};

type ToastViewportProps = {
  toasts: Toast[];
};

export function ToastViewport({ toasts }: ToastViewportProps) {
  return (
    <div className="toast-viewport" aria-live="polite">
      {toasts.map((toast) => (
        <div className={`toast-viewport__toast toast-viewport__toast--${toast.tone}`} key={toast.id}>
          {toast.message}
        </div>
      ))}
    </div>
  );
}
