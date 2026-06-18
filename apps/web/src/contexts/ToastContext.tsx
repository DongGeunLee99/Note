import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { IconCheck, IconX, IconInfoCircle } from '@tabler/icons-react'
import { TONES, type ToneColors } from '@/theme/tones'

type ToastType = 'success' | 'error' | 'info'

interface Toast {
  id: number
  message: string
  type: ToastType
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType, duration?: number) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const ICONS = {
  success: <IconCheck size={14} />,
  error: <IconX size={14} />,
  info: <IconInfoCircle size={14} />,
}

const COLORS: Record<ToastType, ToneColors> = {
  success: TONES.green,
  error: TONES.red,
  info: TONES.blue,
}

let toastId = 0

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback((message: string, type: ToastType = 'info', duration = 3000) => {
    const id = ++toastId
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration)
  }, [])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {createPortal(
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
          {toasts.map(t => (
            <div
              key={t.id}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-[calc(11px*var(--fs))] font-medium shadow-md"
              style={{ background: COLORS[t.type].bg, color: COLORS[t.type].text }}
            >
              {ICONS[t.type]}
              {t.message}
            </div>
          ))}
        </div>,
        document.body,
      )}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx.toast
}
