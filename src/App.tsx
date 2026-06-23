import { useEffect } from 'react'
import { AppFrame } from './components/layout/AppFrame'
import { BottomNav } from './components/layout/BottomNav'
import { SplashScreen } from './components/layout/SplashScreen'
import { Banner } from './components/ui/Banner'
import { ReportProblem, SCREEN_LABELS } from './components/ui/ReportProblem'
import { AppStateProvider, useAppState } from './state/AppStateContext'
import { AICoachScreen } from './screens/AICoachScreen'
import { AuthScreen } from './screens/AuthScreen'
import { ConnectionUpsellScreen } from './screens/ConnectionUpsellScreen'
import { PracticeScreen } from './screens/PracticeScreen'
import { DashboardScreen } from './screens/DashboardScreen'
import { EvolutionScreen } from './screens/EvolutionScreen'
import { ExerciseScreen } from './screens/ExerciseScreen'
import { GoalSelectionScreen } from './screens/GoalSelectionScreen'
import { JournalScreen } from './screens/JournalScreen'
import { ProfileSetupScreen } from './screens/ProfileSetupScreen'
import { SettingsScreen } from './screens/SettingsScreen'
import { SubscriptionScreen } from './screens/SubscriptionScreen'
import { WelcomeScreen } from './screens/WelcomeScreen'

const SCREENS_WITH_NAV = new Set(['dashboard', 'journal', 'aiCoach', 'evolution', 'settings'])
// Telas principais que exibem o atalho discreto de "reportar erro" no rodapé.
// Ajustes fica de fora — lá o reporte já aparece como card completo.
const SCREENS_WITH_REPORT = new Set(['dashboard', 'journal', 'aiCoach', 'evolution'])

function Shell() {
  const { view, mood, banner, dismissBanner, navigate, bootstrapping, user } = useAppState()
  const firstName = user?.name?.trim().split(' ')[0] || undefined

  // Ao trocar de tela, volta o scroll para o topo — sem isso a tela nova herda a
  // posição de rolagem da anterior (ex.: o upsell abria já no meio).
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [view])

  if (bootstrapping) {
    return <SplashScreen />
  }

  const screen = (() => {
    switch (view) {
      case 'welcome':
        return <WelcomeScreen />
      case 'auth':
        return <AuthScreen />
      case 'profile':
        return <ProfileSetupScreen />
      case 'goal':
        return <GoalSelectionScreen />
      case 'subscription':
        return <SubscriptionScreen />
      case 'dashboard':
        return <DashboardScreen />
      case 'journal':
        return <JournalScreen />
      case 'aiCoach':
        return <AICoachScreen />
      case 'evolution':
        return <EvolutionScreen />
      case 'exercise':
        return <ExerciseScreen />
      case 'settings':
        return <SettingsScreen />
      case 'connectionUpsell':
        return <ConnectionUpsellScreen />
      case 'practice':
        return <PracticeScreen />
      default:
        return <WelcomeScreen />
    }
  })()

  return (
    <AppFrame mood={mood} banner={<Banner banner={banner} onDismiss={dismissBanner} />}>
      {screen}
      {SCREENS_WITH_REPORT.has(view) && (
        <ReportProblem variant="footer" currentScreenLabel={SCREEN_LABELS[view] ?? view} />
      )}
      {SCREENS_WITH_NAV.has(view) && <BottomNav active={view} onNavigate={navigate} firstName={firstName} />}
    </AppFrame>
  )
}

function App() {
  return (
    <AppStateProvider>
      <Shell />
    </AppStateProvider>
  )
}

export default App
