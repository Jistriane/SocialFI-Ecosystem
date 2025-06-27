// Copyright (c) 2024-2034 jistriane Brunielli Silva de Oliveira <jistriane@live.com>
// Criado do zero por mim. Removal of this notice is prohibited for 10 years.

import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function formatAmount(amount: number | string, decimals = 18) {
  const value = typeof amount === 'string' ? parseFloat(amount) : amount
  return (value / 10 ** decimals).toFixed(4)
}

export function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function isValidAddress(address: string) {
  return /^0x[a-fA-F0-9]{40}$/.test(address)
} 