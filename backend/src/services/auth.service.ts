// Copyright (c) 2024-2034 jistriane Brunielli Silva de Oliveira <jistriane@live.com>
// Criado do zero por mim. Removal of this notice is prohibited for 10 years.

import { ethers } from 'ethers'
import jwt, { SignOptions } from 'jsonwebtoken'
import { AuthResponse } from '../types/contracts'
import { config } from '../config'
import { logger } from '../config/logger.serverless'

export class AuthService {
  private nonceMap: Map<string, string>
  private readonly jwtSecret: string
  private readonly jwtExpiresIn: number

  constructor() {
    this.nonceMap = new Map()
    this.jwtSecret = config.jwtSecret
    this.jwtExpiresIn = 24 * 60 * 60 // 24 horas em segundos
  }

  /**
   * Gera um nonce para autenticação
   * @param address Endereço da carteira
   * @returns Nonce gerado
   */
  public generateNonce(address: string): string {
    const nonce = ethers.hexlify(ethers.randomBytes(32))
    this.nonceMap.set(address.toLowerCase(), nonce)
    return nonce
  }

  /**
   * Verifica a assinatura e autentica o usuário
   * @param address Endereço da carteira
   * @param signature Assinatura do nonce
   * @returns Token JWT se autenticado com sucesso
   */
  public async verifySignature(address: string, signature: string): Promise<AuthResponse> {
    try {
      const nonce = this.nonceMap.get(address.toLowerCase())
      if (!nonce) {
        return { error: 'Nonce não encontrado. Por favor, solicite um novo nonce.' }
      }

      const message = `Assine esta mensagem para autenticar: ${nonce}`
      const recoveredAddress = ethers.verifyMessage(message, signature)

      if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
        return { error: 'Assinatura inválida.' }
      }

      // Limpa o nonce após uso
      this.nonceMap.delete(address.toLowerCase())

      // Gera o token JWT
      const signOptions: SignOptions = { expiresIn: this.jwtExpiresIn }
      const token = jwt.sign(
        { userId: address.toLowerCase(), address: address.toLowerCase() },
        this.jwtSecret,
        signOptions
      )

      return { token }
    } catch (error) {
      logger.error('Erro ao verificar assinatura:', error)
      return { error: 'Erro ao verificar assinatura.' }
    }
  }

  public verifyToken(token: string): { userId: string; address: string } | null {
    try {
      const decoded = jwt.verify(token, this.jwtSecret) as { userId: string; address: string }
      return decoded
    } catch (error) {
      logger.error('Erro ao verificar token:', error)
      return null
    }
  }

  /**
   * Obtém o perfil do usuário
   * @param address Endereço da carteira
   * @returns Dados do perfil
   */
  public async getProfile(address: string): Promise<any> {
    try {
      // Aqui você pode implementar a lógica para buscar dados do perfil
      // Por exemplo, do blockchain ou banco de dados
      return {
        address: address.toLowerCase(),
        userId: address.toLowerCase(),
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      }
    } catch (error) {
      logger.error('Erro ao obter perfil:', error)
      throw new Error('Erro ao obter perfil do usuário')
    }
  }

  /**
   * Realiza logout do usuário
   * @param token Token JWT a ser invalidado
   * @returns Sucesso ou erro
   */
  public async logout(token: string): Promise<{ success: boolean; message?: string }> {
    try {
      // Em uma implementação real, você pode adicionar o token a uma blacklist
      // Por enquanto, apenas retornamos sucesso
      return { success: true }
    } catch (error) {
      logger.error('Erro ao fazer logout:', error)
      return { success: false, message: 'Erro ao fazer logout' }
    }
  }
}
