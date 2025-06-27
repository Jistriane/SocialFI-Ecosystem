// Copyright (c) 2024-2034 jistriane Brunielli Silva de Oliveira <jistriane@live.com>
// Criado do zero por mim. Removal of this notice is prohibited for 10 years.

'use client'

import { useState } from 'react'
import { useLocale } from '@/contexts/LocaleContext'
import { useAccount } from 'wagmi'
import { useContract } from '@/hooks/useContract'

interface Profile {
  name: string
  bio: string
  avatar: string
  social: {
    twitter: string
    github: string
    discord: string
  }
}

interface FormData {
  name: string
  bio: string
  avatar: string
  social: {
    twitter: string
    github: string
    discord: string
  }
}

export function TrustChainProfile() {
  const { t } = useLocale()
  const { address } = useAccount()
  const { readContract, writeContract } = useContract('TrustChain')
  const [isEditing, setIsEditing] = useState(false)
  const [profile, setProfile] = useState<Profile>({
    name: 'Test User',
    bio: 'Test Bio',
    avatar: 'https://test.com/avatar.jpg',
    social: {
      twitter: 'testuser',
      github: 'testuser',
      discord: 'testuser#1234',
    },
  })
  const [formData, setFormData] = useState<FormData>({
    name: profile.name,
    bio: profile.bio,
    avatar: profile.avatar,
    social: {
      twitter: profile.social.twitter,
      github: profile.social.github,
      discord: profile.social.discord,
    },
  })

  if (!address) {
    return (
      <div className="text-center p-4">
        <p>{t('connect_wallet_to_view_profile')}</p>
      </div>
    )
  }

  if (!profile && !isEditing) {
    return (
      <div className="text-center p-4">
        <p>{t('no_profile_found')}</p>
        <button
          onClick={() => setIsEditing(true)}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {t('create_profile')}
        </button>
      </div>
    )
  }

  const handleChange = (
    field: keyof FormData,
    value: string,
    socialField?: keyof FormData['social'],
  ) => {
    if (socialField) {
      setFormData((prev) => ({
        ...prev,
        social: {
          ...prev.social,
          [socialField]: value,
        },
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }))
    }
  }

  const handleSave = () => {
    setProfile(formData)
    setIsEditing(false)
  }

  if (isEditing) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <h2 className="text-2xl font-bold mb-4">
          {profile ? t('editProfile') : t('createProfile')}
        </h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">
              {t('name')}
            </label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label htmlFor="bio" className="block text-sm font-medium mb-1">
              {t('bio')}
            </label>
            <textarea
              id="bio"
              rows={3}
              value={formData.bio}
              onChange={(e) => handleChange('bio', e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label htmlFor="avatar" className="block text-sm font-medium mb-1">
              {t('avatar')}
            </label>
            <input
              id="avatar"
              type="text"
              value={formData.avatar}
              onChange={(e) => handleChange('avatar', e.target.value)}
              placeholder="URL da imagem"
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <h3 className="font-medium mb-2">{t('social')}</h3>
            <div className="space-y-2">
              <input
                id="twitter"
                type="text"
                value={formData.social.twitter}
                onChange={(e) => handleChange('social', e.target.value, 'twitter')}
                placeholder="Twitter"
                className="w-full p-2 border rounded"
              />
              <input
                id="github"
                type="text"
                value={formData.social.github}
                onChange={(e) => handleChange('social', e.target.value, 'github')}
                placeholder="GitHub"
                className="w-full p-2 border rounded"
              />
              <input
                id="discord"
                type="text"
                value={formData.social.discord}
                onChange={(e) => handleChange('social', e.target.value, 'discord')}
                placeholder="Discord"
                className="w-full p-2 border rounded"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 border rounded hover:bg-gray-100"
            >
              {t('cancel')}
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {t('save')}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center">
          {profile.avatar && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.avatar}
              alt={profile.name}
              className="w-20 h-20 rounded-full mr-4"
            />
          )}
          <div>
            <h2 className="text-2xl font-bold">{profile.name}</h2>
            <p className="text-gray-600">{profile.bio}</p>
          </div>
        </div>
        <button
          onClick={() => setIsEditing(true)}
          className="px-4 py-2 border rounded hover:bg-gray-100"
        >
          {t('edit')}
        </button>
      </div>
      <div className="space-y-4">
        <div>
          <h3 className="font-medium mb-2">{t('social')}</h3>
          <div className="space-y-2">
            {profile.social.twitter && (
              <p>
                Twitter: <span className="text-gray-600">@{profile.social.twitter}</span>
              </p>
            )}
            {profile.social.github && (
              <p>
                GitHub: <span className="text-gray-600">{profile.social.github}</span>
              </p>
            )}
            {profile.social.discord && (
              <p>
                Discord: <span className="text-gray-600">{profile.social.discord}</span>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
