import fs from 'fs';
import path from 'path';
import { logger } from '../config/logger.serverless';

const STORAGE_DIR = path.join(process.cwd(), 'storage');

if (!fs.existsSync(STORAGE_DIR)) {
  fs.mkdirSync(STORAGE_DIR, { recursive: true });
}

class Storage<T> {
  private filename: string;
  private data: T[];
  private autoSave: boolean;

  constructor(name: string, autoSave = true) {
    this.filename = path.join(STORAGE_DIR, `${name}.json`);
    this.autoSave = autoSave;
    this.data = this.load();
  }

  private load(): T[] {
    try {
      if (fs.existsSync(this.filename)) {
        const content = fs.readFileSync(this.filename, 'utf-8');
        return JSON.parse(content);
      }
    } catch (error) {
      logger.error('Erro ao carregar arquivo:', error);
    }
    return [];
  }

  private save(): void {
    try {
      fs.writeFileSync(this.filename, JSON.stringify(this.data, null, 2));
    } catch (error) {
      logger.error('Erro ao salvar arquivo:', error);
    }
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
    if (this.autoSave) this.save();
  }

  update(predicate: (item: T) => boolean, newData: Partial<T>): boolean {
    const index = this.data.findIndex(predicate);
    if (index !== -1) {
      this.data[index] = { ...this.data[index], ...newData };
      if (this.autoSave) this.save();
      return true;
    }
    return false;
  }

  remove(predicate: (item: T) => boolean): boolean {
    const index = this.data.findIndex(predicate);
    if (index !== -1) {
      this.data.splice(index, 1);
      if (this.autoSave) this.save();
      return true;
    }
    return false;
  }

  clear(): void {
    this.data = [];
    if (this.autoSave) this.save();
  }

  forceSave(): void {
    this.save();
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
