// Copyright (c) 2024-2034 jistriane Brunielli Silva de Oliveira <jistriane@live.com>
// Criado do zero por mim. Removal of this notice is prohibited for 10 years.

import { useEffect, useCallback, useState } from 'react'
import { Socket } from 'socket.io-client'
import { socketManager, SocketEvents } from '@/config/socket'
import { useAccount } from 'wagmi'

interface UseSocketOptions {
  autoConnect?: boolean
  onConnect?: () => void
  onDisconnect?: () => void
  onError?: (error: Error) => void
}

export const useSocket = (options: UseSocketOptions = {}) => {
  const { autoConnect = true, onConnect, onDisconnect, onError } = options
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const { address } = useAccount()

  const connect = useCallback(() => {
    if (!address) return

    const newSocket = socketManager.connect(address)
    setSocket(newSocket)
  }, [address])

  const disconnect = useCallback(() => {
    socketManager.disconnect()
    setSocket(null)
    setIsConnected(false)
  }, [])

  useEffect(() => {
    if (!socket) return

    const handleConnect = () => {
      setIsConnected(true)
      onConnect?.()
    }

    const handleDisconnect = () => {
      setIsConnected(false)
      onDisconnect?.()
    }

    const handleError = (error: Error) => {
      onError?.(error)
    }

    socket.on(SocketEvents.CONNECT, handleConnect)
    socket.on(SocketEvents.DISCONNECT, handleDisconnect)
    socket.on(SocketEvents.CONNECT_ERROR, handleError)

    return () => {
      socket.off(SocketEvents.CONNECT, handleConnect)
      socket.off(SocketEvents.DISCONNECT, handleDisconnect)
      socket.off(SocketEvents.CONNECT_ERROR, handleError)
    }
  }, [socket, onConnect, onDisconnect, onError])

  useEffect(() => {
    if (autoConnect && address) {
      connect()
    }

    return () => {
      disconnect()
    }
  }, [autoConnect, address, connect, disconnect])

  const emit = useCallback(<T = any>(event: string, data?: T) => {
    if (!socket) return
    socket.emit(event, data)
  }, [socket])

  const on = useCallback(<T = any>(
    event: string,
    callback: (data: T) => void
  ) => {
    if (!socket) return () => {}
    socket.on(event, callback)
    return () => socket.off(event, callback)
  }, [socket])

  const once = useCallback(<T = any>(
    event: string,
    callback: (data: T) => void
  ) => {
    if (!socket) return () => {}
    socket.once(event, callback)
    return () => socket.off(event, callback)
  }, [socket])

  return {
    socket,
    isConnected,
    connect,
    disconnect,
    emit,
    on,
    once
  }
}

export type { Socket }
export { SocketEvents } 