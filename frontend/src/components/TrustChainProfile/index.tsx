// Copyright (c) 2024-2034 jistriane Brunielli Silva de Oliveira <jistriane@live.com>
// Criado do zero por mim. Removal of this notice is prohibited for 10 years.

'use client'

import React, { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { useContract } from '@/hooks/useContract'
import { useTranslation } from '@/hooks/useTranslation'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'

interface ProfileData {
  name: string
  bio: string
  avatar: string
  social: {
    twitter: string
    github: string
    discord: string
  }
  verified: boolean
  trustScore: number
  endorsements: number
  exists: boolean
}

interface TrustChainProfileProps {
  address?: string
  onProfileUpdate?: (profile: ProfileData) => void
}

export function TrustChainProfile({
  address,
  onProfileUpdate,
}: TrustChainProfileProps) {
  const { t } = useTranslation('trustchain')
  const { address: connectedAddress } = useAccount()
  const { toast } = useToast()
  const targetAddress = address || connectedAddress

  const [profile, setProfile] = useState<ProfileData>({
    name: '',
    bio: '',
    avatar: '',
    social: {
      twitter: '',
      github: '',
      discord: '',
    },
    verified: false,
    trustScore: 0,
    endorsements: 0,
    exists: false,
  })

  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Hooks do contrato
  const { isReady, contractAddress } = useContract('TrustChain')

  // Função para buscar perfil
  const fetchProfile = async () => {
    if (!targetAddress || !isReady || !contractAddress) return

    setIsLoading(true)
    try {
      // Simular busca de perfil
      const profileData = {
        name: 'Nome do Usuário',
        bio: 'Descrição do perfil',
        avatar: 'https://via.placeholder.com/150',
        social: {
          twitter: '@usuario',
          github: 'usuario',
          discord: 'usuario#1234',
        },
        verified: true,
        trustScore: 85,
        endorsements: 12,
        exists: true,
      }

      setProfile(profileData)
      onProfileUpdate?.(profileData)
    } catch (error) {
      console.error('Erro ao buscar perfil:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar o perfil',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Função para salvar perfil
  const saveProfile = async () => {
    if (!targetAddress || !isReady || !contractAddress) return

    setIsSaving(true)
    try {
      // Simular salvamento
      await new Promise((resolve) => setTimeout(resolve, 2000))

      toast({
        title: 'Sucesso',
        description: 'Perfil atualizado com sucesso',
      })

      setIsEditing(false)
      onProfileUpdate?.(profile)
    } catch (error) {
      console.error('Erro ao salvar perfil:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar o perfil',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Função para lidar com mudanças
  const handleChange = (
    field: keyof ProfileData | 'social',
    value: string,
    socialField?: keyof ProfileData['social'],
  ) => {
    setProfile((prev) => {
      if (field === 'social' && socialField) {
        return {
          ...prev,
          social: {
            ...prev.social,
            [socialField]: value,
          },
        }
      }
      return {
        ...prev,
        [field]: value,
      }
    })
  }

  // Carregar perfil quando o endereço muda
  useEffect(() => {
    if (targetAddress) {
      fetchProfile()
    }
  }, [targetAddress, isReady, contractAddress])

  const isOwnProfile = targetAddress === connectedAddress

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!profile.exists && !isOwnProfile) {
    return (
      <div className="text-center p-8 text-gray-500">
        <p>{t('profile.not_found')}</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      {/* Header do perfil */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <img
            src={profile.avatar || 'https://via.placeholder.com/80'}
            alt="Avatar"
            className="w-20 h-20 rounded-full object-cover"
          />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {profile.name || t('profile.unnamed')}
            </h2>
            <p className="text-gray-600">{targetAddress?.slice(0, 10)}...</p>
            {profile.verified && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                ✓ {t('profile.verified')}
              </span>
            )}
          </div>
        </div>

        {isOwnProfile && (
          <Button
            onClick={() => setIsEditing(!isEditing)}
            variant="outline"
            disabled={isSaving}
          >
            {isEditing ? t('profile.cancel') : t('profile.edit')}
          </Button>
        )}
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-blue-600">
            {profile.trustScore}
          </div>
          <div className="text-sm text-gray-600">{t('profile.trust_score')}</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-green-600">
            {profile.endorsements}
          </div>
          <div className="text-sm text-gray-600">
            {t('profile.endorsements')}
          </div>
        </div>
      </div>

      {/* Formulário de edição ou visualização */}
      <div className="space-y-4">
        {/* Nome */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('profile.name')}
          </label>
          {isEditing ? (
            <input
              type="text"
              value={profile.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={t('profile.name_placeholder')}
            />
          ) : (
            <p className="text-gray-900">{profile.name || t('profile.not_set')}</p>
          )}
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('profile.bio')}
          </label>
          {isEditing ? (
            <textarea
              value={profile.bio}
              onChange={(e) => handleChange('bio', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={t('profile.bio_placeholder')}
            />
          ) : (
            <p className="text-gray-900">{profile.bio || t('profile.not_set')}</p>
          )}
        </div>

        {/* Avatar URL */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('profile.avatar_url')}
          </label>
          {isEditing ? (
            <input
              type="url"
              value={profile.avatar}
              onChange={(e) => handleChange('avatar', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://example.com/avatar.jpg"
            />
          ) : (
            <p className="text-gray-900">
              {profile.avatar || t('profile.not_set')}
            </p>
          )}
        </div>

        {/* Redes sociais */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('profile.social_media')}
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Twitter */}
            <div>
              <label className="block text-xs text-gray-500 mb-1">Twitter</label>
              {isEditing ? (
                <input
                  type="text"
                  value={profile.social.twitter}
                  onChange={(e) =>
                    handleChange('social', e.target.value, 'twitter')
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="@username"
                />
              ) : (
                <p className="text-gray-900">
                  {profile.social.twitter || t('profile.not_set')}
                </p>
              )}
            </div>

            {/* GitHub */}
            <div>
              <label className="block text-xs text-gray-500 mb-1">GitHub</label>
              {isEditing ? (
                <input
                  type="text"
                  value={profile.social.github}
                  onChange={(e) =>
                    handleChange('social', e.target.value, 'github')
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="username"
                />
              ) : (
                <p className="text-gray-900">
                  {profile.social.github || t('profile.not_set')}
                </p>
              )}
            </div>

            {/* Discord */}
            <div>
              <label className="block text-xs text-gray-500 mb-1">Discord</label>
              {isEditing ? (
                <input
                  type="text"
                  value={profile.social.discord}
                  onChange={(e) =>
                    handleChange('social', e.target.value, 'discord')
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="username#1234"
                />
              ) : (
                <p className="text-gray-900">
                  {profile.social.discord || t('profile.not_set')}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Botões de ação */}
        {isEditing && (
          <div className="flex gap-3 pt-4">
            <Button
              onClick={saveProfile}
              disabled={isSaving}
              className="flex-1"
            >
              {isSaving ? t('profile.saving') : t('profile.save')}
            </Button>
            <Button
              onClick={() => setIsEditing(false)}
              variant="outline"
              className="flex-1"
            >
              {t('profile.cancel')}
            </Button>
          </div>
        )}

        {/* Ações para outros perfis */}
        {!isOwnProfile && profile.exists && (
          <div className="flex gap-3 pt-4">
            <Button className="flex-1">{t('profile.endorse')}</Button>
            <Button variant="outline" className="flex-1">
              {t('profile.report')}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default TrustChainProfile
