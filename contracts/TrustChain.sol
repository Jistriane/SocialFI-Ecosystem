// Copyright (c) 2024-2034 jistriane Brunielli Silva de Oliveira <jistriane@live.com>
// Criado do zero por mim. Removal of this notice is prohibited for 10 years.

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./interfaces/ITrustChain.sol";

/**
 * @title TrustChain
 * @dev Sistema de reputação e confiança do ecossistema SocialFI
 */
contract TrustChain is ITrustChain, Ownable, ReentrancyGuard {
    // Estruturas
    struct Profile {
        string username;
        bool isVerified;
        uint256 trustScore;
        uint256 lastUpdate;
        bool exists;
    }

    // Constantes
    uint256 public constant MIN_USERNAME_LENGTH = 3;
    uint256 public constant MAX_USERNAME_LENGTH = 30;
    uint256 public constant INITIAL_TRUST_SCORE = 100;
    uint256 public constant MAX_TRUST_SCORE = 1000;
    uint256 public constant MIN_TRUST_SCORE = 0;

    // Mapeamentos
    mapping(address => Profile) private profiles;
    mapping(string => address) private usernameToAddress;

    // Modificadores
    modifier onlyValidUsername(string memory username) {
        bytes memory usernameBytes = bytes(username);
        require(
            usernameBytes.length >= MIN_USERNAME_LENGTH &&
            usernameBytes.length <= MAX_USERNAME_LENGTH,
            "TrustChain: Invalid username length"
        );
        _;
    }

    modifier profileExists(address user) {
        require(profiles[user].exists, "TrustChain: Profile does not exist");
        _;
    }

    modifier profileNotExists(address user) {
        require(!profiles[user].exists, "TrustChain: Profile already exists");
        _;
    }

    /**
     * @dev Cria um novo perfil
     * @param username Nome de usuário desejado
     */
    function createProfile(string memory username) 
        external 
        override 
        nonReentrant 
        profileNotExists(msg.sender)
        onlyValidUsername(username)
    {
        require(
            usernameToAddress[username] == address(0),
            "TrustChain: Username already taken"
        );

        profiles[msg.sender] = Profile({
            username: username,
            isVerified: false,
            trustScore: INITIAL_TRUST_SCORE,
            lastUpdate: block.timestamp,
            exists: true
        });

        usernameToAddress[username] = msg.sender;
        emit ProfileCreated(msg.sender, username);
    }

    /**
     * @dev Atualiza um perfil existente
     * @param username Novo nome de usuário
     */
    function updateProfile(string memory username)
        external
        override
        nonReentrant
        profileExists(msg.sender)
        onlyValidUsername(username)
    {
        require(
            usernameToAddress[username] == address(0) ||
            usernameToAddress[username] == msg.sender,
            "TrustChain: Username already taken"
        );

        string memory oldUsername = profiles[msg.sender].username;
        delete usernameToAddress[oldUsername];

        profiles[msg.sender].username = username;
        profiles[msg.sender].lastUpdate = block.timestamp;
        usernameToAddress[username] = msg.sender;

        emit ProfileUpdated(msg.sender, username);
    }

    /**
     * @dev Atualiza as métricas de um usuário
     * @param user Endereço do usuário
     * @param score Nova pontuação
     */
    function updateMetrics(address user, uint256 score)
        external
        override
        onlyOwner
        profileExists(user)
    {
        require(score <= MAX_TRUST_SCORE, "TrustChain: Score exceeds maximum");
        
        profiles[user].trustScore = score;
        profiles[user].lastUpdate = block.timestamp;
        
        emit ScoreUpdated(user, score);
    }

    /**
     * @dev Calcula a pontuação de confiança de um usuário
     * @param user Endereço do usuário
     * @return Pontuação calculada
     */
    function calculateScore(address user)
        external
        view
        override
        profileExists(user)
        returns (uint256)
    {
        return profiles[user].trustScore;
    }

    /**
     * @dev Valida a identidade de um usuário
     * @param user Endereço do usuário
     * @return Status de verificação
     */
    function validateIdentity(address user)
        external
        view
        override
        profileExists(user)
        returns (bool)
    {
        return profiles[user].isVerified;
    }

    /**
     * @dev Retorna o perfil de um usuário
     * @param user Endereço do usuário
     * @return username Nome do usuário
     * @return isVerified Status de verificação
     * @return trustScore Pontuação de confiança
     * @return lastUpdate Última atualização
     */
    function getUserProfile(address user)
        external
        view
        override
        profileExists(user)
        returns (
            string memory username,
            bool isVerified,
            uint256 trustScore,
            uint256 lastUpdate
        )
    {
        Profile memory profile = profiles[user];
        return (
            profile.username,
            profile.isVerified,
            profile.trustScore,
            profile.lastUpdate
        );
    }

    /**
     * @dev Verifica um perfil (apenas owner)
     * @param user Endereço do usuário
     */
    function verifyProfile(address user)
        external
        onlyOwner
        profileExists(user)
    {
        require(!profiles[user].isVerified, "TrustChain: Profile already verified");
        profiles[user].isVerified = true;
        emit ProfileUpdated(user, profiles[user].username);
    }
} 