// Copyright (c) 2024-2034 jistriane Brunielli Silva de Oliveira <jistriane@live.com>
// Criado do zero por mim. Removal of this notice is prohibited for 10 years.

import { renderHook, act } from '@testing-library/react';
import { LocaleProvider, useLocale } from '../contexts/LocaleContext';
import { useTranslation } from './useTranslation';
import React from 'react';

describe('useTranslation', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <LocaleProvider>{children}</LocaleProvider>
    );

    it('should return translation for simple key', () => {
        const { result } = renderHook(() => useTranslation('common'), { wrapper });
        
        expect(result.current.t('navigation.home')).toBe('Início');
    });

    it('should return translation with variables', () => {
        const { result } = renderHook(() => useTranslation('trustchain'), { wrapper });
        
        const translation = result.current.t('profile.welcome', { name: 'John' });
        expect(translation).toBe('Bem-vindo, John');
    });

    it('should return key when translation is not found', () => {
        const { result } = renderHook(() => useTranslation('common'), { wrapper });
        
        const nonExistentKey = 'non.existent.key';
        expect(result.current.t(nonExistentKey)).toBe(nonExistentKey);
    });

    it('should switch languages correctly', () => {
        const { result: localeResult } = renderHook(() => useLocale(), { wrapper });
        const { result: translationResult } = renderHook(() => useTranslation('common'), { wrapper });

        // Verificar tradução inicial em PT-BR
        expect(translationResult.current.t('navigation.home')).toBe('Início');

        // Mudar para inglês
        act(() => {
            localeResult.current.setLocale('en');
        });

        // Verificar tradução em inglês
        expect(translationResult.current.t('navigation.home')).toBe('Home');
    });

    it('should handle nested translations', () => {
        const { result } = renderHook(() => useTranslation('govgame'), { wrapper });
        
        expect(result.current.t('dashboard.active_proposals')).toBe('Propostas Ativas');
        expect(result.current.t('proposals.voting_period')).toBe('Período de Votação');
    });
}); 