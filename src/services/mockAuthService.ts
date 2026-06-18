import type { AuthProvider, User } from '../types'
import { delay, generateId, readValue, writeValue } from './localStorageDb'
import type { AuthResult, AuthService } from './types'

// Mock de Firebase Auth (Google + Apple + e-mail). Troque por uma implementação
// real importando o Firebase SDK aqui dentro — o contrato AuthService não muda.
const USER_KEY = 'currentUser'
const SOCIAL_FAILURE_RATE = 0.05

function buildUser(provider: AuthProvider, email: string): User {
  return {
    id: generateId('user'),
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
    const existing = readValue<User>(USER_KEY)
    const user = existing ?? buildUser('google', 'mariana.silva@gmail.com')
    writeValue(USER_KEY, user)
    return { user }
  }

  async signInWithApple(): Promise<AuthResult> {
    await delay(700)
    if (Math.random() < SOCIAL_FAILURE_RATE) {
      throw new Error('apple_failed')
    }
    const existing = readValue<User>(USER_KEY)
    const user = existing ?? buildUser('apple', 'mariana.silva@icloud.com')
    writeValue(USER_KEY, user)
    return { user }
  }

  async signInWithEmail(email: string): Promise<AuthResult> {
    await delay(600)
    const existing = readValue<User>(USER_KEY)
    const user = existing ?? buildUser('email', email)
    writeValue(USER_KEY, user)
    return { user }
  }

  async signOut(): Promise<void> {
    await delay(200)
    localStorage.removeItem('soulspace:currentUser')
  }

  async updateProfile(userId: string, patch: Partial<Pick<User, 'name' | 'age' | 'status' | 'goal' | 'email'>>): Promise<User> {
    await delay(400)
    const existing = readValue<User>(USER_KEY)
    const base = existing && existing.id === userId ? existing : null
    if (!base) throw new Error('user_not_found')
    const updated: User = { ...base, ...patch }
    writeValue(USER_KEY, updated)
    return updated
  }
}

export const mockAuthService = new MockAuthService()
