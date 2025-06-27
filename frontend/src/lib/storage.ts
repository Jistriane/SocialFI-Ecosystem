// Copyright (c) 2024-2034 jistriane Brunielli Silva de Oliveira <jistriane@live.com>
// Criado do zero por mim. Removal of this notice is prohibited for 10 years.

/**
 * Classe para gerenciar armazenamento local
 */
export class LocalStorage<T> {
  private key: string;

  constructor(key: string) {
    this.key = key;
  }

  /**
   * Obtém todos os itens
   */
  getAll(): T[] {
    try {
      const data = localStorage.getItem(this.key);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  /**
   * Obtém um item por predicado
   */
  find(predicate: (item: T) => boolean): T | undefined {
    return this.getAll().find(predicate);
  }

  /**
   * Filtra itens por predicado
   */
  filter(predicate: (item: T) => boolean): T[] {
    return this.getAll().filter(predicate);
  }

  /**
   * Adiciona um item
   */
  add(item: T): void {
    const items = this.getAll();
    items.push(item);
    this.save(items);
  }

  /**
   * Atualiza um item por predicado
   */
  update(predicate: (item: T) => boolean, newData: Partial<T>): boolean {
    const items = this.getAll();
    const index = items.findIndex(predicate);
    
    if (index !== -1) {
      items[index] = { ...items[index], ...newData };
      this.save(items);
      return true;
    }
    
    return false;
  }

  /**
   * Remove um item por predicado
   */
  remove(predicate: (item: T) => boolean): boolean {
    const items = this.getAll();
    const index = items.findIndex(predicate);
    
    if (index !== -1) {
      items.splice(index, 1);
      this.save(items);
      return true;
    }
    
    return false;
  }

  /**
   * Limpa todos os dados
   */
  clear(): void {
    localStorage.removeItem(this.key);
  }

  /**
   * Salva os dados
   */
  private save(items: T[]): void {
    localStorage.setItem(this.key, JSON.stringify(items));
  }
}

// Interfaces
export interface Profile {
  address: string;
  name: string;
  bio: string;
  avatar: string;
  social: {
    twitter?: string;
    github?: string;
    discord?: string;
  };
}

export interface Trade {
  id: number;
  creator: string;
  partner?: string;
  amount: number;
  token: string;
  price: number;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  createdAt: number;
  updatedAt: number;
}

export interface Proposal {
  id: number;
  creator: string;
  title: string;
  description: string;
  startBlock: number;
  endBlock: number;
  status: 'pending' | 'active' | 'executed' | 'cancelled';
  votes: {
    for: number;
    against: number;
    abstain: number;
  };
}

// Instâncias de armazenamento
export const profiles = new LocalStorage<Profile>('profiles');
export const trades = new LocalStorage<Trade>('trades');
export const proposals = new LocalStorage<Proposal>('proposals');

export default {
  LocalStorage,
  profiles,
  trades,
  proposals,
};
