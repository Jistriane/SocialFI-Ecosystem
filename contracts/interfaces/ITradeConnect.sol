// Copyright (c) 2024-2034 jistriane Brunielli Silva de Oliveira <jistriane@live.com>
// Criado do zero por mim. Removal of this notice is prohibited for 10 years.

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

/**
 * @title ITradeConnect
 * @dev Interface para o sistema de trocas P2P
 */
interface ITradeConnect {
    // Enums
    enum TradeStatus { Active, Completed, Cancelled }

    // Eventos
    event TradeCreated(
        uint256 indexed tradeId,
        address indexed maker,
        address tokenOffered,
        address tokenWanted,
        uint256 amountOffered,
        uint256 amountWanted,
        uint256 deadline
    );
    event TradeAccepted(uint256 indexed tradeId, address indexed taker);
    event TradeCancelled(uint256 indexed tradeId);

    /**
     * @dev Cria uma nova troca
     * @param tokenOffered Token oferecido
     * @param tokenWanted Token desejado
     * @param amountOffered Quantidade oferecida
     * @param amountWanted Quantidade desejada
     * @param deadline Prazo para a troca
     * @return ID da troca criada
     */
    function createTrade(
        address tokenOffered,
        address tokenWanted,
        uint256 amountOffered,
        uint256 amountWanted,
        uint256 deadline
    ) external returns (uint256);

    /**
     * @dev Aceita uma troca existente
     * @param tradeId ID da troca
     */
    function acceptTrade(uint256 tradeId) external;

    /**
     * @dev Cancela uma troca existente
     * @param tradeId ID da troca
     */
    function cancelTrade(uint256 tradeId) external;

    /**
     * @dev Retorna os detalhes de uma troca
     * @param tradeId ID da troca
     * @return maker Criador da troca
     * @return taker Aceitante da troca
     * @return tokenOffered Token oferecido
     * @return tokenWanted Token desejado
     * @return amountOffered Quantidade oferecida
     * @return amountWanted Quantidade desejada
     * @return deadline Prazo da troca
     * @return status Status da troca
     * @return createdAt Data de criação
     */
    function getTrade(uint256 tradeId) external view returns (
        address maker,
        address taker,
        address tokenOffered,
        address tokenWanted,
        uint256 amountOffered,
        uint256 amountWanted,
        uint256 deadline,
        TradeStatus status,
        uint256 createdAt
    );

    /**
     * @dev Retorna as trocas de um usuário
     * @param user Endereço do usuário
     * @return Array com os IDs das trocas
     */
    function getUserTrades(address user) external view returns (uint256[] memory);
} 