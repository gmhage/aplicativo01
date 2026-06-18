// Pequeno wrapper sobre localStorage, simulando a persistência que o Firebase
// daria de verdade. Cada coleção fica numa chave própria, namespaced pelo app.

const NAMESPACE = 'soulspace'

function key(collection: string) {
  return `${NAMESPACE}:${collection}`
}

export function readCollection<T>(collection: string): T[] {
  try {
    const raw = localStorage.getItem(key(collection))
    return raw ? (JSON.parse(raw) as T[]) : []
  } catch {
    return []
  }
}

export function writeCollection<T>(collection: string, items: T[]): void {
  try {
    localStorage.setItem(key(collection), JSON.stringify(items))
  } catch {
    // Quota cheia ou storage bloqueado (modo privado). Sem isso, o app
    // ainda funciona na sessão atual, só não persiste entre recarregamentos.
  }
}

export function readValue<T>(name: string): T | null {
  try {
    const raw = localStorage.getItem(key(name))
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

export function writeValue<T>(name: string, value: T): void {
  try {
    localStorage.setItem(key(name), JSON.stringify(value))
  } catch {
    // ver nota acima
  }
}

export function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

// Remove uma lista específica de coleções/valores do nosso namespace.
export function removeCollections(names: string[]): void {
  try {
    for (const name of names) localStorage.removeItem(key(name))
  } catch {
    // storage bloqueado (modo privado): nada a apagar nesta sessão.
  }
}

/** Simula a latência de rede de um serviço remoto real. */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
