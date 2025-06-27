// Copyright (c) 2024-2034 jistriane Brunielli Silva de Oliveira <jistriane@live.com>
// Criado do zero por mim. Removal of this notice is prohibited for 10 years.

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useAccount } from 'wagmi';
import { TrustChainProfile } from './index';
import { useTranslation } from '../../hooks/useTranslation';
import { useStorage } from '../../hooks/useStorage';
import { useSocket } from '../../hooks/useSocket';
import { LocaleProvider } from '@/contexts/LocaleContext';

// Mock dos hooks
jest.mock('wagmi', () => ({
  useAccount: jest.fn(() => ({
    address: '0x1234567890123456789012345678901234567890',
  })),
}));

jest.mock('../../hooks/useTranslation', () => ({
  useTranslation: jest.fn()
}));

jest.mock('../../hooks/useStorage', () => ({
  useStorage: jest.fn()
}));

jest.mock('../../hooks/useSocket', () => ({
  useSocket: jest.fn()
}));

describe('TrustChainProfile', () => {
  const mockAddress = '0x123...';
  const mockProfile = {
    address: mockAddress,
    name: 'Test User',
    bio: 'Test Bio',
    avatar: 'https://test.com/avatar.jpg',
    social: {
      twitter: 'testuser',
      github: 'testuser',
      discord: 'testuser#1234'
    }
  };

  beforeEach(() => {
    // Mock do useAccount
    (useAccount as jest.Mock).mockReturnValue({
      address: mockAddress
    });

    // Mock do useTranslation
    (useTranslation as jest.Mock).mockReturnValue({
      t: (key: string) => key
    });

    // Mock do useStorage
    (useStorage as jest.Mock).mockReturnValue({
      items: [mockProfile],
      addItem: jest.fn(),
      updateItem: jest.fn()
    });

    // Mock do useSocket
    (useSocket as jest.Mock).mockReturnValue({
      emit: jest.fn()
    });
  });

  it('deve renderizar mensagem de conectar carteira quando não há endereço', () => {
    jest.spyOn(require('wagmi'), 'useAccount').mockReturnValue({ address: null });
    render(
      <LocaleProvider>
        <TrustChainProfile />
      </LocaleProvider>
    );
    expect(screen.getByText('connect_wallet_to_view_profile')).toBeInTheDocument();
  });

  it('deve renderizar perfil quando existente', () => {
    render(
      <LocaleProvider>
        <TrustChainProfile />
      </LocaleProvider>
    );
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('Test Bio')).toBeInTheDocument();
  });

  it('deve mostrar formulário de edição ao clicar em editar', () => {
    render(
      <LocaleProvider>
        <TrustChainProfile />
      </LocaleProvider>
    );
    fireEvent.click(screen.getByText('edit'));
    expect(screen.getByLabelText('name')).toBeInTheDocument();
    expect(screen.getByLabelText('bio')).toBeInTheDocument();
    expect(screen.getByLabelText('avatar')).toBeInTheDocument();
  });

  it('deve mostrar opção de criar perfil quando não existe', () => {
    jest.spyOn(require('wagmi'), 'useAccount').mockReturnValue({
      address: '0x1234567890123456789012345678901234567890',
    });
    render(
      <LocaleProvider>
        <TrustChainProfile />
      </LocaleProvider>
    );
    expect(screen.getByText('create_profile')).toBeInTheDocument();
  });

  it('deve salvar alterações do perfil', async () => {
    const mockUpdateItem = jest.fn();
    const mockEmit = jest.fn();

    (useStorage as jest.Mock).mockReturnValue({
      items: [mockProfile],
      addItem: jest.fn(),
      updateItem: mockUpdateItem
    });

    (useSocket as jest.Mock).mockReturnValue({
      emit: mockEmit
    });

    render(
      <LocaleProvider>
        <TrustChainProfile />
      </LocaleProvider>
    );
    
    // Entrar no modo de edição
    fireEvent.click(screen.getByText('edit'));

    // Alterar o nome
    const nameInput = screen.getByLabelText('name');
    fireEvent.change(nameInput, { target: { value: 'New Name' } });

    // Alterar o bio
    const bioInput = screen.getByLabelText('bio');
    fireEvent.change(bioInput, { target: { value: 'New Bio' } });

    // Alterar o avatar
    const avatarInput = screen.getByLabelText('avatar');
    fireEvent.change(avatarInput, { target: { value: 'https://new.com/avatar.jpg' } });

    // Alterar o Twitter
    const twitterInput = screen.getByPlaceholderText('Twitter');
    fireEvent.change(twitterInput, { target: { value: 'newuser' } });

    // Alterar o GitHub
    const githubInput = screen.getByPlaceholderText('GitHub');
    fireEvent.change(githubInput, { target: { value: 'newuser' } });

    // Alterar o Discord
    const discordInput = screen.getByPlaceholderText('Discord');
    fireEvent.change(discordInput, { target: { value: 'newuser#5678' } });

    // Salvar alterações
    fireEvent.click(screen.getByText('save'));

    await waitFor(() => {
      expect(mockUpdateItem).toHaveBeenCalled();
      expect(mockEmit).toHaveBeenCalledWith('profile:update', expect.any(Object));
    });

    expect(screen.getByText('New Name')).toBeInTheDocument();
    expect(screen.getByText('New Bio')).toBeInTheDocument();
  });
});
