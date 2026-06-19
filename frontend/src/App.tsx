import { useState } from 'react'
import { Toaster } from 'react-hot-toast'
import { Grid3x3, Activity, Trophy, Zap, LogOut } from 'lucide-react'
import { getStoredIdentity, markHomePage, clearHomePage, shouldShowHome } from './lib/session'
import type { StoredIdentity } from './lib/session'
import { useWebSocket } from './hooks/useWebSocket'
import { Grid } from './components/Grid'
import { Sidebar } from './components/Sidebar'
import { OnlineCount } from './components/OnlineCount'
import { MatchTimer } from './components/MatchTimer'
import { MatchOverlay } from './components/MatchOverlay'
import { ExitConfirmModal } from './components/ExitConfirmModal'
import { UserSetupModal } from './components/UserSetupModal'

function GameView({ identity, onGoHome }: { identity: StoredIdentity; onGoHome: () => void }) {
  const { claimTileWS, exitMatch } = useWebSocket(identity)
  const [showExitModal, setShowExitModal] = useState(false)

  const handleConfirmExit = () => {
    exitMatch()
    onGoHome()
  }

  return (
    <div className="flex flex-col h-screen bg-slate-50 font-sans">
      <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200/80 flex-shrink-0 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center text-white shadow-md shadow-brand-100">
            <Grid3x3 className="w-4 h-4" />
          </div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold font-serif text-slate-900 tracking-tight">Gridy</h1>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-brand-50 text-brand-600 border border-brand-100/50">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
              Live
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <MatchTimer />
          <div className="w-[1px] h-4 bg-slate-200" />
          <OnlineCount />
          <div className="w-[1px] h-4 bg-slate-200" />
          <button
            onClick={() => setShowExitModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-rose-500 border border-rose-200 bg-rose-50 hover:bg-rose-100 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            Exit Match
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <Grid onClaim={claimTileWS} />
        <Sidebar />
      </div>

      <MatchOverlay onGoHome={onGoHome} />
      {showExitModal && (
        <ExitConfirmModal
          onConfirm={handleConfirmExit}
          onCancel={() => setShowExitModal(false)}
        />
      )}
    </div>
  )
}

export default function App() {
  const [identity, setIdentity] = useState<StoredIdentity | null>(() =>
    shouldShowHome() ? null : getStoredIdentity()
  )
  const [showSetup, setShowSetup] = useState(false)

  if (!identity) {
    return (
      <div className="bg-slate-50 min-h-screen flex flex-col items-center justify-between p-6 font-sans relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{ 
            backgroundImage: 'radial-gradient(#AA9183 1.5px, transparent 1.5px)', 
            backgroundSize: '24px 24px' 
          }} 
        />
        


        <div className="max-w-3xl text-center my-auto flex flex-col items-center z-10 px-4">
          
          
          <h1 className="text-5xl md:text-7xl font-extrabold font-serif text-slate-900 tracking-tight leading-tight mb-6">
            Gridy
          </h1>
          

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-2xl mb-12 text-left">
            <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-[0_4px_12px_rgba(0,0,0,0.01)] hover:shadow-md transition-shadow">
              <div className="w-9 h-9 rounded-lg bg-brand-50 flex items-center justify-center text-brand-500 mb-3.5">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">Real Time Action</h3>
              <p className="text-xs text-slate-500 leading-normal">
                Instant tile ownership updates streamed via WebSockets.
              </p>
            </div>

            <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-[0_4px_12px_rgba(0,0,0,0.01)] hover:shadow-md transition-shadow">
              <div className="w-9 h-9 rounded-lg bg-brand-50 flex items-center justify-center text-brand-500 mb-3.5">
                <Trophy className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">Live Leaderboard</h3>
              <p className="text-xs text-slate-500 leading-normal">
                Compete for the top spot by holding the most tiles simultaneously.
              </p>
            </div>

            <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-[0_4px_12px_rgba(0,0,0,0.01)] hover:shadow-md transition-shadow">
              <div className="w-9 h-9 rounded-lg bg-brand-50 flex items-center justify-center text-brand-500 mb-3.5">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">Tactical Cooldown</h3>
              <p className="text-xs text-slate-500 leading-normal">
                Optimize your clicks around a dynamic cooldown timer.
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowSetup(true)}
            className="px-8 py-4 bg-brand-500 text-white font-semibold text-base rounded-full shadow-lg shadow-brand-500/30 hover:bg-brand-600 transition-all hover:scale-[1.03] active:scale-98 cursor-pointer font-sans"
            style={{ boxShadow: '0 10px 25px -5px rgba(170, 145, 131, 0.4)' }}
          >
            Let's Play
          </button>
        </div>



        {showSetup && (
          <UserSetupModal
            onComplete={(id) => { clearHomePage(); setShowSetup(false); setIdentity(id) }}
            onCancel={() => setShowSetup(false)}
          />
        )}

        <Toaster position="bottom-right" />
      </div>
    )
  }

  const goHome = () => { markHomePage(); setIdentity(null) }

  return (
    <>
      <GameView identity={identity} onGoHome={goHome} />
      <Toaster
        position="bottom-right"
        toastOptions={{
          className: '!bg-white !text-slate-800 !border !border-slate-100 !shadow-lg !rounded-xl !text-sm !font-sans',
        }}
      />
    </>
  )
}
