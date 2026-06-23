import type { AuthProvider, User } from '../types'
import { delay, readValue, writeValue } from './localStorageDb'
import type { AuthResult, AuthService } from './types'

// Mock de Firebase Auth (Google + Apple + e-mail). Troque por uma implementação
// real importando o Firebase SDK aqui dentro — o contrato AuthService não muda.
const USER_KEY = 'currentUser'
const ACCOUNTS_KEY = 'accounts' // "banco" de contas por e-mail, sobrevive ao logout
const SOCIAL_FAILURE_RATE = 0.05

// Id ESTÁVEL derivado do e-mail: no login real (Firebase/Supabase) a identidade
// é fixa, então sair e entrar de novo recupera o MESMO usuário (e os dados, que
// são vinculados ao id). Aqui reproduzimos isso para o "Sair → Entrar" funcionar.
function stableId(email: string): string {
  const normalized = email.trim().toLowerCase()
  let hash = 0
  for (let i = 0; i < normalized.length; i += 1) {
    hash = (hash * 31 + normalized.charCodeAt(i)) >>> 0
  }
  return `user_${hash.toString(36)}`
}

// Lê o "banco" de contas (por e-mail) que persiste mesmo após o logout.
function readAccounts(): Record<string, User> {
  return readValue<Record<string, User>>(ACCOUNTS_KEY) ?? {}
}

function saveAccount(user: User): void {
  const accounts = readAccounts()
  accounts[user.email.trim().toLowerCase()] = user
  writeValue(ACCOUNTS_KEY, accounts)
}

// Recupera a conta pelo e-mail (a "memória" entre sessões); ou cria uma nova.
function getOrCreateAccount(provider: AuthProvider, email: string): User {
  const accounts = readAccounts()
  const key = email.trim().toLowerCase()
  const existing = accounts[key]
  if (existing) return existing
  return {
    id: stableId(email),
    email,
    name: '',
    age: 0,
    status: '',
    goal: null,
    authProvider: provider,
    createdAt: new Date().toISOString(),
    subscriptionPlan: null,
    subscriptionStatus: null,
  }
}

class MockAuthService implements AuthService {
  async getCurrentUser(): Promise<User | null> {
    await delay(120)
    return readValue<User>(USER_KEY)
  }

  async signInWithGoogle(): Promise<AuthResult> {
    await delay(700)
    if (Math.random() < SOCIAL_FAILURE_RATE) {
      throw new Error('google_failed')
    }
    const user = getOrCreateAccount('google', 'mariana.silva@gmail.com')
    saveAccount(user)
    writeValue(USER_KEY, user)
    return { user }
  }

  async signInWithApple(): Promise<AuthResult> {
    await delay(700)
    if (Math.random() < SOCIAL_FAILURE_RATE) {
      throw new Error('apple_failed')
    }
    const user = getOrCreateAccount('apple', 'mariana.silva@icloud.com')
    saveAccount(user)
    writeValue(USER_KEY, user)
    return { user }
  }

  async signInWithEmail(email: string): Promise<AuthResult> {
    await delay(600)
    // Recupera a conta pelo e-mail (volta de onde parou) ou cria uma nova.
    const user = getOrCreateAccount('email', email)
    saveAccount(user)
    writeValue(USER_KEY, user)
    return { user }
  }

  async signOut(): Promise<void> {
    await delay(200)
    // Só encerra a SESSÃO (remove o usuário atual). As contas e os dados
    // continuam salvos, para o próximo login recuperar de onde parou.
    localStorage.removeItem('soulspace:currentUser')
  }

  async updateProfile(userId: string, patch: Partial<Pick<User, 'name' | 'age' | 'status' | 'goal' | 'email'>>): Promise<User> {
    await delay(400)
    const existing = readValue<User>(USER_KEY)
    const base = existing && existing.id === userId ? existing : null
    if (!base) throw new Error('user_not_found')
    const updated: User = { ...base, ...patch }
    writeValue(USER_KEY, updated)
    saveAccount(updated) // mantém a conta sincronizada para sobreviver ao logout
    return updated
  }
}

export const mockAuthService = new MockAuthService()
