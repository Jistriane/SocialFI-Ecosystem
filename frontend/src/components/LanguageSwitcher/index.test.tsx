// Copyright (c) 2024-2034 jistriane Brunielli Silva de Oliveira <jistriane@live.com>
// Criado do zero por mim. Removal of this notice is prohibited for 10 years.

import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { LocaleProvider } from '../../contexts/LocaleContext';
import { LanguageSwitcher } from './index';

describe('LanguageSwitcher', () => {
    const renderWithProvider = () => {
        return render(
            <LocaleProvider>
                <LanguageSwitcher />
            </LocaleProvider>
        );
    };

    beforeEach(() => {
        // Limpar localStorage antes de cada teste
        localStorage.clear();
    });

    it('should render language buttons', () => {
        renderWithProvider();

        expect(screen.getByText('PT-BR')).toBeInTheDocument();
        expect(screen.getByText('EN')).toBeInTheDocument();
    });

    it('should highlight PT-BR button by default', () => {
        renderWithProvider();

        const ptButton = screen.getByText('PT-BR').closest('button');
        const enButton = screen.getByText('EN').closest('button');

        expect(ptButton).toHaveClass('bg-blue-500');
        expect(enButton).toHaveClass('bg-gray-200');
    });

    it('should switch language when clicking buttons', () => {
        renderWithProvider();

        // Clicar no botão EN
        fireEvent.click(screen.getByText('EN'));

        // Verificar se o botão EN está destacado
        const enButton = screen.getByText('EN').closest('button');
        expect(enButton).toHaveClass('bg-blue-500');

        // Verificar se o localStorage foi atualizado
        expect(localStorage.setItem).toHaveBeenCalledWith('locale', 'en');

        // Clicar no botão PT-BR
        fireEvent.click(screen.getByText('PT-BR'));

        // Verificar se o botão PT-BR está destacado
        const ptButton = screen.getByText('PT-BR').closest('button');
        expect(ptButton).toHaveClass('bg-blue-500');

        // Verificar se o localStorage foi atualizado
        expect(localStorage.setItem).toHaveBeenCalledWith('locale', 'pt-BR');
    });

    it('should load saved language from localStorage', () => {
        // Simular idioma salvo
        (localStorage.getItem as jest.Mock).mockReturnValue('en');

        renderWithProvider();

        const enButton = screen.getByText('EN').closest('button');
        expect(enButton).toHaveClass('bg-blue-500');
    });
}); 