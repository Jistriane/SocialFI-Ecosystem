// Copyright (c) 2024-2034 jistriane Brunielli Silva de Oliveira <jistriane@live.com>
// Criado do zero por mim. Removal of this notice is prohibited for 10 years.

import { renderHook, act } from '@testing-library/react';
import { useSocket, SocketEvents } from './useSocket';
import { socketManager } from '@/config/socket';
import { useAccount } from 'wagmi';
import { useAppStore } from '@/stores/useAppStore';

// Mock das dependências
jest.mock('wagmi', () => ({
  useAccount: jest.fn(),
}));

jest.mock('@/stores/useAppStore', () => ({
  useAppStore: jest.fn(),
}));

jest.mock('@/config/socket', () => ({
  socketManager: {
    connect: jest.fn(),
    disconnect: jest.fn(),
  },
  SocketEvents: {
    CONNECT: 'connect',
    DISCONNECT: 'disconnect',
    CONNECT_ERROR: 'connect_error',
  },
}));

describe('useSocket', () => {
  const mockSocket = {
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
    once: jest.fn(),
  };

  const mockAddress = '0x123';
  const mockToken = 'token123';

  beforeEach(() => {
    jest.clearAllMocks();
    (useAccount as jest.Mock).mockReturnValue({ address: mockAddress });
    (useAppStore as unknown as jest.Mock).mockReturnValue({ token: mockToken });
    (socketManager.connect as jest.Mock).mockReturnValue(mockSocket);
  });

  it('deve conectar automaticamente quando autoConnect é true', () => {
    renderHook(() => useSocket({ autoConnect: true }));
    expect(socketManager.connect).toHaveBeenCalledWith(mockToken);
  });

  it('não deve conectar automaticamente quando autoConnect é false', () => {
    renderHook(() => useSocket({ autoConnect: false }));
    expect(socketManager.connect).not.toHaveBeenCalled();
  });

  it('deve conectar quando connect é chamado manualmente', () => {
    const { result } = renderHook(() => useSocket({ autoConnect: false }));
    act(() => {
      result.current.connect();
    });
    expect(socketManager.connect).toHaveBeenCalledWith(mockToken);
  });

  it('deve desconectar quando disconnect é chamado', () => {
    const { result } = renderHook(() => useSocket());
    act(() => {
      result.current.disconnect();
    });
    expect(socketManager.disconnect).toHaveBeenCalled();
  });

  it('deve chamar onConnect quando socket conecta', () => {
    const onConnect = jest.fn();
    renderHook(() => useSocket({ onConnect }));

    // Simular evento de conexão
    const connectHandler = mockSocket.on.mock.calls.find(
      ([event]) => event === SocketEvents.CONNECT
    )[1];
    act(() => {
      connectHandler();
    });

    expect(onConnect).toHaveBeenCalled();
  });

  it('deve chamar onDisconnect quando socket desconecta', () => {
    const onDisconnect = jest.fn();
    renderHook(() => useSocket({ onDisconnect }));

    // Simular evento de desconexão
    const disconnectHandler = mockSocket.on.mock.calls.find(
      ([event]) => event === SocketEvents.DISCONNECT
    )[1];
    act(() => {
      disconnectHandler();
    });

    expect(onDisconnect).toHaveBeenCalled();
  });

  it('deve chamar onError quando ocorre erro de conexão', () => {
    const onError = jest.fn();
    const mockError = new Error('Connection failed');
    renderHook(() => useSocket({ onError }));

    // Simular evento de erro
    const errorHandler = mockSocket.on.mock.calls.find(
      ([event]) => event === SocketEvents.CONNECT_ERROR
    )[1];
    act(() => {
      errorHandler(mockError);
    });

    expect(onError).toHaveBeenCalledWith(mockError);
  });

  it('deve emitir eventos corretamente', () => {
    const { result } = renderHook(() => useSocket());
    const eventName = 'test-event';
    const eventData = { test: 'data' };

    act(() => {
      result.current.emit(eventName, eventData);
    });

    expect(mockSocket.emit).toHaveBeenCalledWith(eventName, eventData);
  });

  it('deve registrar listeners de eventos corretamente', () => {
    const { result } = renderHook(() => useSocket());
    const eventName = 'test-event';
    const callback = jest.fn();

    act(() => {
      result.current.on(eventName, callback);
    });

    expect(mockSocket.on).toHaveBeenCalledWith(eventName, callback);
  });

  it('deve registrar listeners one-time corretamente', () => {
    const { result } = renderHook(() => useSocket());
    const eventName = 'test-event';
    const callback = jest.fn();

    act(() => {
      result.current.once(eventName, callback);
    });

    expect(mockSocket.once).toHaveBeenCalledWith(eventName, callback);
  });

  it('deve limpar listeners ao desmontar', () => {
    const { unmount } = renderHook(() => useSocket());
    unmount();
    expect(socketManager.disconnect).toHaveBeenCalled();
  });

  it('não deve conectar se não houver endereço ou token', () => {
    (useAccount as jest.Mock).mockReturnValue({ address: null });
    (useAppStore as unknown as jest.Mock).mockReturnValue({ token: null });

    const { result } = renderHook(() => useSocket());
    act(() => {
      result.current.connect();
    });

    expect(socketManager.connect).not.toHaveBeenCalled();
  });

  it('deve atualizar isConnected corretamente', () => {
    const { result } = renderHook(() => useSocket());

    // Inicialmente desconectado
    expect(result.current.isConnected).toBe(false);

    // Simular conexão
    const connectHandler = mockSocket.on.mock.calls.find(
      ([event]) => event === SocketEvents.CONNECT
    )[1];
    act(() => {
      connectHandler();
    });
    expect(result.current.isConnected).toBe(true);

    // Simular desconexão
    const disconnectHandler = mockSocket.on.mock.calls.find(
      ([event]) => event === SocketEvents.DISCONNECT
    )[1];
    act(() => {
      disconnectHandler();
    });
    expect(result.current.isConnected).toBe(false);
  });
}); 