
export function Dialog({ open, onOpenChange, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      {children}
    </div>
  );
}

export function DialogContent({ className = '', children }) {
  return (
    <div className={`bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 w-full max-w-lg ${className}`}>
      {children}
    </div>
  );
}

export function DialogHeader({ children }) {
  return <div className="mb-4">{children}</div>;
}

export function DialogTitle({ children }) {
  return <h2 className="text-lg font-semibold mb-2">{children}</h2>;
}

export function DialogFooter({ children }) {
  return <div className="mt-6 flex justify-end gap-2">{children}</div>;
}
