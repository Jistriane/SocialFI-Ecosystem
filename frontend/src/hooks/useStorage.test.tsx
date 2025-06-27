// Copyright (c) 2024-2034 jistriane Brunielli Silva de Oliveira <jistriane@live.com>
// Criado do zero por mim. Removal of this notice is prohibited for 10 years.

import { renderHook, act } from '@testing-library/react';
import { useStorage } from './useStorage';
import { LocalStorage } from '../lib/storage';

interface TestItem {
  id: number;
  name: string;
}

describe('useStorage', () => {
  let storage: LocalStorage<TestItem>;

  beforeEach(() => {
    localStorage.clear();
    storage = new LocalStorage<TestItem>('test');
  });

  it('deve inicializar com array vazio', () => {
    const { result } = renderHook(() => useStorage(storage));
    expect(result.current.items).toEqual([]);
  });

  it('deve adicionar um item', () => {
    const { result } = renderHook(() => useStorage(storage));
    const newItem = { id: 1, name: 'Test' };

    act(() => {
      result.current.addItem(newItem);
    });

    expect(result.current.items).toEqual([newItem]);
  });

  it('deve atualizar um item', () => {
    const { result } = renderHook(() => useStorage(storage));
    const item = { id: 1, name: 'Test' };

    act(() => {
      result.current.addItem(item);
    });

    act(() => {
      result.current.updateItem(
        i => i.id === 1,
        { name: 'Updated' }
      );
    });

    expect(result.current.items[0].name).toBe('Updated');
  });

  it('deve remover um item', () => {
    const { result } = renderHook(() => useStorage(storage));
    const item = { id: 1, name: 'Test' };

    act(() => {
      result.current.addItem(item);
    });

    act(() => {
      result.current.removeItem(i => i.id === 1);
    });

    expect(result.current.items).toEqual([]);
  });

  it('deve limpar todos os itens', () => {
    const { result } = renderHook(() => useStorage(storage));
    const items = [
      { id: 1, name: 'Test 1' },
      { id: 2, name: 'Test 2' }
    ];

    act(() => {
      items.forEach(item => result.current.addItem(item));
    });

    act(() => {
      result.current.clearItems();
    });

    expect(result.current.items).toEqual([]);
  });
});
