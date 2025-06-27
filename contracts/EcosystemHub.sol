// Copyright (c) 2024-2034 jistriane Brunielli Silva de Oliveira <jistriane@live.com>
// Criado do zero por mim. Removal of this notice is prohibited for 10 years.

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./interfaces/ITrustChain.sol";
import "./interfaces/ITradeConnect.sol";
import "./interfaces/IGovGame.sol";

/**
 * @title EcosystemHub
 * @dev Contrato central que conecta todos os componentes do ecossistema SocialFI
 */
contract EcosystemHub is Ownable, ReentrancyGuard {
    // Contratos do ecossistema
    ITrustChain public trustChain;
    ITradeConnect public tradeConnect;
    IGovGame public govGame;

    // Constantes para cálculo de pontuação
    uint256 private constant TRUST_WEIGHT = 40;
    uint256 private constant TRADE_WEIGHT = 30;
    uint256 private constant GOVERNANCE_WEIGHT = 30;

    // Eventos
    event TrustChainUpdated(address indexed newAddress);
    event TradeConnectUpdated(address indexed newAddress);
    event GovGameUpdated(address indexed newAddress);
    event MetricsUpdated(
        address indexed user,
        uint256 trustScore,
        uint256 tradeVolume,
        uint256 governanceParticipation
    );

    constructor(
        address _trustChain,
        address _tradeConnect,
        address _govGame
    ) {
        require(_trustChain != address(0), "EcosystemHub: Invalid TrustChain address");
        require(_tradeConnect != address(0), "EcosystemHub: Invalid TradeConnect address");
        require(_govGame != address(0), "EcosystemHub: Invalid GovGame address");

        trustChain = ITrustChain(_trustChain);
        tradeConnect = ITradeConnect(_tradeConnect);
        govGame = IGovGame(_govGame);
    }

    /**
     * @dev Atualiza o endereço do contrato TrustChain
     * @param newAddress Novo endereço
     */
    function updateTrustChain(address newAddress) external onlyOwner {
        require(newAddress != address(0), "EcosystemHub: Invalid address");
        trustChain = ITrustChain(newAddress);
        emit TrustChainUpdated(newAddress);
    }

    /**
     * @dev Atualiza o endereço do contrato TradeConnect
     * @param newAddress Novo endereço
     */
    function updateTradeConnect(address newAddress) external onlyOwner {
        require(newAddress != address(0), "EcosystemHub: Invalid address");
        tradeConnect = ITradeConnect(newAddress);
        emit TradeConnectUpdated(newAddress);
    }

    /**
     * @dev Atualiza o endereço do contrato GovGame
     * @param newAddress Novo endereço
     */
    function updateGovGame(address newAddress) external onlyOwner {
        require(newAddress != address(0), "EcosystemHub: Invalid address");
        govGame = IGovGame(newAddress);
        emit GovGameUpdated(newAddress);
    }

    /**
     * @dev Atualiza as métricas de um usuário
     * @param user Endereço do usuário
     */
    function updateMetrics(address user) external {
        require(user != address(0), "EcosystemHub: Invalid address");

        // Obtém as métricas dos diferentes sistemas
        uint256 trustScore = trustChain.calculateScore(user);
        uint256 tradeVolume = _calculateTradeVolume(user);
        uint256 governanceParticipation = _calculateGovernanceParticipation(user);

        // Calcula a nova pontuação com base nas métricas
        uint256 newScore = _calculateNewScore(
            trustScore,
            tradeVolume,
            governanceParticipation
        );

        // Atualiza a pontuação no TrustChain
        trustChain.updateMetrics(user, newScore);

        emit MetricsUpdated(
            user,
            trustScore,
            tradeVolume,
            governanceParticipation
        );
    }

    /**
     * @dev Calcula o volume de trades de um usuário
     * @param user Endereço do usuário
     */
    function _calculateTradeVolume(address user) internal view returns (uint256) {
        uint256[] memory userTrades = tradeConnect.getUserTrades(user);
        uint256 totalVolume = 0;

        for (uint256 i = 0; i < userTrades.length; i++) {
            (
                address maker,
                address taker,
                ,
                ,
                uint256 amountOffered,
                uint256 amountWanted,
                ,
                ITradeConnect.TradeStatus status,
            ) = tradeConnect.getTrade(userTrades[i]);

            if (status == ITradeConnect.TradeStatus.Completed) {
                if (maker == user) {
                    totalVolume += amountOffered;
                } else if (taker == user) {
                    totalVolume += amountWanted;
                }
            }
        }

        return totalVolume;
    }

    /**
     * @dev Calcula a participação em governança de um usuário
     * @param user Endereço do usuário
     */
    function _calculateGovernanceParticipation(address user) internal view returns (uint256) {
        uint256[] memory proposals = govGame.getUserProposals(user);
        uint256[] memory votes = govGame.getUserVotes(user);
        
        uint256 participation = proposals.length * 100; // Peso maior para criação de propostas

        for (uint256 i = 0; i < votes.length; i++) {
            (bool support, uint256 votingPower, , ) = govGame.getVote(votes[i], user);
            if (support) {
                participation += votingPower;
            }
        }

        return participation;
    }

    /**
     * @dev Calcula a nova pontuação com base nas métricas
     * @param trustScore Pontuação atual de confiança
     * @param tradeVolume Volume de trades
     * @param governanceParticipation Participação em governança
     */
    function _calculateNewScore(
        uint256 trustScore,
        uint256 tradeVolume,
        uint256 governanceParticipation
    ) internal pure returns (uint256) {
        // Normaliza as métricas para uma escala de 0-100
        uint256 normalizedTrade = (tradeVolume > 1000 ether) ? 100 : (tradeVolume * 100) / (1000 ether);
        uint256 normalizedGovernance = (governanceParticipation > 1000) ? 100 : (governanceParticipation * 100) / 1000;
        uint256 normalizedTrust = (trustScore > 1000) ? 100 : (trustScore * 100) / 1000;

        // Calcula a pontuação ponderada
        uint256 weightedScore = (
            (normalizedTrust * TRUST_WEIGHT) +
            (normalizedTrade * TRADE_WEIGHT) +
            (normalizedGovernance * GOVERNANCE_WEIGHT)
        ) / 100;

        // Retorna a pontuação final (0-1000)
        return weightedScore * 10;
    }
} 