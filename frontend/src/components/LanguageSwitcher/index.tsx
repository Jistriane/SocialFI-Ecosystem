// Copyright (c) 2024-2034 jistriane Brunielli Silva de Oliveira <jistriane@live.com>
// Criado do zero por mim. Removal of this notice is prohibited for 10 years.

'use client'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useLocale } from '@/contexts/LocaleContext'
import { Languages } from 'lucide-react'
import { useEffect } from 'react'

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useLocale()

  useEffect(() => {
    console.log('LanguageSwitcher - Current locale:', locale)
    console.log('LanguageSwitcher - t function test:', t('language.pt-BR'))
  }, [locale, t])

  const handleLanguageChange = (newLocale: 'pt-BR' | 'en') => {
    console.log('Changing language from', locale, 'to', newLocale)
    setLocale(newLocale)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Languages className="h-[1.2rem] w-[1.2rem]" />
          <span className="absolute -top-1 -right-1 text-xs font-bold text-metis-400">
            {locale === 'pt-BR' ? 'PT' : 'EN'}
          </span>
          <span className="sr-only">Alterar idioma</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem 
          onClick={() => handleLanguageChange('pt-BR')}
          className={locale === 'pt-BR' ? 'bg-metis-500/20' : ''}
        >
          <span className="flex items-center justify-between w-full">
            {t('language.pt-BR')}
            {locale === 'pt-BR' && <span className="text-metis-400">✓</span>}
          </span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleLanguageChange('en')}
          className={locale === 'en' ? 'bg-metis-500/20' : ''}
        >
          <span className="flex items-center justify-between w-full">
            {t('language.en')}
            {locale === 'en' && <span className="text-metis-400">✓</span>}
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 