// Mock do Sentry: grava uma marca quando o app encontra um erro não tratado,
// para que o reabrir possa exibir o aviso de recuperação só quando algo de
// fato quebrou — não em toda recarga normal de página.
const CRASH_KEY = 'soulspace:lastCrash'

export function installCrashTracker() {
  window.addEventListener('error', () => {
    try {
      localStorage.setItem(CRASH_KEY, '1')
    } catch {
      // sem storage disponível, segue sem marcar
    }
  })
  window.addEventListener('unhandledrejection', () => {
    try {
      localStorage.setItem(CRASH_KEY, '1')
    } catch {
      // ver nota acima
    }
  })
}

export function consumeCrashFlag(): boolean {
  try {
    const hadCrash = localStorage.getItem(CRASH_KEY) === '1'
    if (hadCrash) localStorage.removeItem(CRASH_KEY)
    return hadCrash
  } catch {
    return false
  }
}
