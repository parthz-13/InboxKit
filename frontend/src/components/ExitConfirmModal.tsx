import { LogOut } from 'lucide-react'

interface ExitConfirmModalProps {
  onConfirm: () => void
  onCancel: () => void
}

export function ExitConfirmModal({ onConfirm, onCancel }: ExitConfirmModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md font-sans">
      <div className="bg-white border border-slate-200/80 rounded-3xl p-8 w-full max-w-xs text-center shadow-2xl">
        <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center text-rose-500 mx-auto mb-4">
          <LogOut className="w-5 h-5" />
        </div>

        <h2 className="text-lg font-extrabold font-serif text-slate-900 mb-1.5 tracking-tight">Leave Match?</h2>
        <p className="text-xs text-slate-500 leading-relaxed mb-6">
          Your claimed tiles will remain until the match ends. You'll be taken back to the home screen.
        </p>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            Stay
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-rose-500 hover:bg-rose-600 transition-colors cursor-pointer"
          >
            Leave Match
          </button>
        </div>
      </div>
    </div>
  )
}
