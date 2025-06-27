// Copyright (c) 2024-2034 jistriane Brunielli Silva de Oliveira <jistriane@live.com>
// Criado do zero por mim. Removal of this notice is prohibited for 10 years.

'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useAppStore } from '@/stores/useAppStore'
import { useHydration } from '@/hooks/useHydration'

type Locale = 'pt-BR' | 'en'

interface LocaleContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string, namespace?: string) => string
  isReady: boolean
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined)

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const isHydrated = useHydration()
  const { language, setLanguage } = useAppStore()
  const [translations, setTranslations] = useState<Record<string, any>>({})
  const [isReady, setIsReady] = useState(false)
  const [currentLocale, setCurrentLocale] = useState<Locale>(language)

  // Sincronizar locale local com o store
  useEffect(() => {
    if (isHydrated && language !== currentLocale) {
      setCurrentLocale(language)
    }
  }, [language, isHydrated, currentLocale])

  useEffect(() => {
    if (!isHydrated) return

    const loadTranslations = async () => {
      try {
        setIsReady(false)
        console.log('Loading translations for language:', currentLocale)

        const [
          commonTranslations,
          trustchainTranslations,
          tradeconnectTranslations,
          govgameTranslations,
        ] = await Promise.all([
          import(`@/locales/${currentLocale}/common.json`),
          import(`@/locales/${currentLocale}/trustchain.json`),
          import(`@/locales/${currentLocale}/tradeconnect.json`),
          import(`@/locales/${currentLocale}/govgame.json`),
        ])

        const newTranslations = {
          common: commonTranslations.default || commonTranslations,
          trustchain: trustchainTranslations.default || trustchainTranslations,
          tradeconnect:
            tradeconnectTranslations.default || tradeconnectTranslations,
          govgame: govgameTranslations.default || govgameTranslations,
        }

        console.log('Translations loaded:', newTranslations)
        setTranslations(newTranslations)
        setIsReady(true)
      } catch (error) {
        console.error('Error loading translations:', error)
        setIsReady(true)
      }
    }

    loadTranslations()
  }, [currentLocale, isHydrated])

  const handleSetLocale = useCallback((newLocale: Locale) => {
    console.log('LocaleContext: Changing locale from', currentLocale, 'to', newLocale)
    setCurrentLocale(newLocale)
    setLanguage(newLocale)
    
    // Forçar re-render
    setIsReady(false)
  }, [currentLocale, setLanguage])

  const t = useCallback((key: string, namespace = 'common') => {
    if (!isReady) return key

    const keys = key.split('.')
    let value = translations[namespace] || {}

    for (const k of keys) {
      value = value[k]
      if (value === undefined) {
        console.warn(`Translation missing for key: ${namespace}.${key}`)
        return key
      }
    }

    return value || key
  }, [isReady, translations])

  return (
    <LocaleContext.Provider
      value={{
        locale: currentLocale,
        setLocale: handleSetLocale,
        t,
        isReady,
      }}
    >
      {children}
    </LocaleContext.Provider>
  )
}

export function useLocale() {
  const context = useContext(LocaleContext)
  if (context === undefined) {
    throw new Error('useLocale must be used within a LocaleProvider')
  }
  return context
} 