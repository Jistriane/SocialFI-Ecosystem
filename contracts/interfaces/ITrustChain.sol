// Copyright (c) 2024-2034 jistriane Brunielli Silva de Oliveira <jistriane@live.com>
// Criado do zero por mim. Removal of this notice is prohibited for 10 years.

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

/**
 * @title ITrustChain
 * @dev Interface para o sistema de reputação e confiança
 */
interface ITrustChain {
    // Eventos
    event ProfileCreated(address indexed user, string username);
    event ProfileUpdated(address indexed user, string username);
    event ScoreUpdated(address indexed user, uint256 newScore);

    /**
     * @dev Cria um novo perfil
     * @param username Nome de usuário desejado
     */
    function createProfile(string memory username) external;

    /**
     * @dev Atualiza um perfil existente
     * @param username Novo nome de usuário
     */
    function updateProfile(string memory username) external;

    /**
     * @dev Atualiza as métricas de um usuário
     * @param user Endereço do usuário
     * @param score Nova pontuação
     */
    function updateMetrics(address user, uint256 score) external;

    /**
     * @dev Calcula a pontuação de confiança de um usuário
     * @param user Endereço do usuário
     * @return Pontuação calculada
     */
    function calculateScore(address user) external view returns (uint256);

    /**
     * @dev Valida a identidade de um usuário
     * @param user Endereço do usuário
     * @return Status de verificação
     */
    function validateIdentity(address user) external view returns (bool);

    /**
     * @dev Retorna o perfil de um usuário
     * @param user Endereço do usuário
     * @return username Nome do usuário
     * @return isVerified Status de verificação
     * @return trustScore Pontuação de confiança
     * @return lastUpdate Última atualização
     */
    function getUserProfile(address user) external view returns (
        string memory username,
        bool isVerified,
        uint256 trustScore,
        uint256 lastUpdate
    );
} 