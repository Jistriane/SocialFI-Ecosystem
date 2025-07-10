// Copyright (c) 2024-2034 jistriane Brunielli Silva de Oliveira <jistriane@live.com>
// Criado do zero por mim. Removal of this notice is prohibited for 10 years.

import { useState, useEffect, useCallback } from 'react'
import { LocalStorage } from '../lib/storage'

export function useStorage<T>(storage: LocalStorage<T>) {
  const [items, setItems] = useState<T[]>([])

  // Carregar dados iniciais
  useEffect(() => {
    setItems(storage.getAll())
  }, [storage])

  // Adicionar item
  const addItem = useCallback(
    (item: T) => {
      storage.add(item)
      setItems(storage.getAll())
    },
    [storage],
  )

  // Atualizar item
  const updateItem = useCallback(
    (predicate: (item: T) => boolean, newData: Partial<T>) => {
      if (storage.update(predicate, newData)) {
        setItems(storage.getAll())
        return true
      }
      return false
    },
    [storage],
  )

  // Remover item
  const removeItem = useCallback(
    (predicate: (item: T) => boolean) => {
      if (storage.remove(predicate)) {
        setItems(storage.getAll())
        return true
      }
      return false
    },
    [storage],
  )

  // Limpar todos os itens
  const clearItems = useCallback(() => {
    storage.clear()
    setItems([])
  }, [storage])

  return {
    items,
    addItem,
    updateItem,
    removeItem,
    clearItems,
  }
}
