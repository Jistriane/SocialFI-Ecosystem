// Copyright (c) 2024-2034 jistriane Brunielli Silva de Oliveira <jistriane@live.com>
// Criado do zero por mim. Removal of this notice is prohibited for 10 years.

'use client'

import { Settings, Moon, Globe, Bell, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { useLocale } from '@/contexts/LocaleContext'

export default function SettingsPage() {
  const { t } = useLocale()

  return (
    <div className="container mx-auto p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <section className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
              <Settings className="w-8 h-8 text-gray-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold">
            {t('settings.title', 'common')}
          </h1>
          <p className="text-muted-foreground">
            {t('settings.description', 'common')}
          </p>
        </section>

        {/* Settings Sections */}
        <div className="space-y-6">
          {/* General Settings */}
          <section className="border rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Globe className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-semibold">
                {t('settings.sections.general', 'common')}
              </h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">
                    {t('settings.general.language', 'common')}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t('settings.general.language_desc', 'common')}
                  </p>
                </div>
                <LanguageSwitcher />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">
                    {t('settings.general.theme', 'common')}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t('settings.general.theme_desc', 'common')}
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  <Moon className="w-4 h-4 mr-2" />
                  {t('settings.general.dark', 'common')}
                </Button>
              </div>
            </div>
          </section>

          {/* Notifications */}
          <section className="border rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Bell className="w-5 h-5 text-yellow-600" />
              <h2 className="text-xl font-semibold">
                {t('settings.sections.notifications', 'common')}
              </h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">
                    {t(
                      'settings.notifications.transaction_notifications',
                      'common',
                    )}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t(
                      'settings.notifications.transaction_notifications_desc',
                      'common',
                    )}
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  {t('settings.notifications.enabled', 'common')}
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">
                    {t(
                      'settings.notifications.governance_notifications',
                      'common',
                    )}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t(
                      'settings.notifications.governance_notifications_desc',
                      'common',
                    )}
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  {t('settings.notifications.enabled', 'common')}
                </Button>
              </div>
            </div>
          </section>

          {/* Security */}
          <section className="border rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-5 h-5 text-red-600" />
              <h2 className="text-xl font-semibold">
                {t('settings.sections.security', 'common')}
              </h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">
                    {t('settings.security.two_factor', 'common')}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t('settings.security.two_factor_desc', 'common')}
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  {t('settings.security.configure', 'common')}
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">
                    {t('settings.security.active_sessions', 'common')}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t('settings.security.active_sessions_desc', 'common')}
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  {t('settings.security.view_sessions', 'common')}
                </Button>
              </div>
            </div>
          </section>
        </div>

        {/* Save Button */}
        <section className="flex justify-center">
          <Button size="lg" className="px-8">
            {t('settings.actions.save_settings', 'common')}
          </Button>
        </section>
      </div>
    </div>
  )
}
