import { logger } from '../config/logger.serverless';

// Storage em memória para ambiente serverless
class Storage<T> {
  private data: T[];
  private name: string;

  constructor(name: string) {
    this.name = name;
    this.data = [];
    logger.info(`Storage ${name} initialized in memory`);
  }

  getAll(): T[] {
    return [...this.data];
  }

  get(index: number): T | undefined {
    return this.data[index];
  }

  find(predicate: (item: T) => boolean): T | undefined {
    return this.data.find(predicate);
  }

  filter(predicate: (item: T) => boolean): T[] {
    return this.data.filter(predicate);
  }

  add(item: T): void {
    this.data.push(item);
    logger.debug(`Item added to ${this.name} storage`);
  }

  update(predicate: (item: T) => boolean, newData: Partial<T>): boolean {
    const index = this.data.findIndex(predicate);
    if (index !== -1) {
      this.data[index] = { ...this.data[index], ...newData };
      logger.debug(`Item updated in ${this.name} storage`);
      return true;
    }
    return false;
  }

  remove(predicate: (item: T) => boolean): boolean {
    const index = this.data.findIndex(predicate);
    if (index !== -1) {
      this.data.splice(index, 1);
      logger.debug(`Item removed from ${this.name} storage`);
      return true;
    }
    return false;
  }

  clear(): void {
    this.data = [];
    logger.debug(`${this.name} storage cleared`);
  }

  forceSave(): void {
    // No-op para compatibilidade
    logger.debug(`${this.name} storage save requested (no-op in serverless)`);
  }
}

export interface User {
  id: string;
  address: string;
  nonce: string;
  lastLogin: number;
}

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

export const users = new Storage<User>('users');
export const profiles = new Storage<Profile>('profiles');
export const proposals = new Storage<Proposal>('proposals');
export const trades = new Storage<Trade>('trades');

export default {
  Storage,
  users,
  profiles,
  proposals,
  trades,
}; 