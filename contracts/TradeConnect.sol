// Copyright (c) 2024-2034 jistriane Brunielli Silva de Oliveira <jistriane@live.com>
// Criado do zero por mim. Removal of this notice is prohibited for 10 years.

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./interfaces/ITradeConnect.sol";
import "./interfaces/ITrustChain.sol";

/**
 * @title TradeConnect
 * @dev Sistema de trocas P2P do ecossistema SocialFI
 */
contract TradeConnect is ITradeConnect, Ownable, ReentrancyGuard {
    // Estruturas
    struct Trade {
        address maker;
        address taker;
        address tokenOffered;
        address tokenWanted;
        uint256 amountOffered;
        uint256 amountWanted;
        uint256 deadline;
        TradeStatus status;
        uint256 createdAt;
    }

    // Constantes
    uint256 public constant MIN_TRADE_DURATION = 1 hours;
    uint256 public constant MAX_TRADE_DURATION = 7 days;
    uint256 public constant MIN_TRUST_SCORE = 50;

    // Variáveis de estado
    ITrustChain public trustChain;
    uint256 public tradeCount;
    mapping(uint256 => Trade) public trades;
    mapping(address => uint256[]) public userTrades;

    // Modificadores
    modifier validTrade(uint256 tradeId) {
        require(tradeId < tradeCount, "TradeConnect: Invalid trade ID");
        _;
    }

    modifier onlyMaker(uint256 tradeId) {
        require(trades[tradeId].maker == msg.sender, "TradeConnect: Not trade maker");
        _;
    }

    modifier tradeActive(uint256 tradeId) {
        require(
            trades[tradeId].status == TradeStatus.Active &&
            block.timestamp < trades[tradeId].deadline,
            "TradeConnect: Trade not active"
        );
        _;
    }

    constructor(address _trustChain) {
        require(_trustChain != address(0), "TradeConnect: Invalid TrustChain address");
        trustChain = ITrustChain(_trustChain);
    }

    /**
     * @dev Cria uma nova troca
     * @param tokenOffered Token oferecido
     * @param tokenWanted Token desejado
     * @param amountOffered Quantidade oferecida
     * @param amountWanted Quantidade desejada
     * @param duration Duração da troca em segundos
     */
    function createTrade(
        address tokenOffered,
        address tokenWanted,
        uint256 amountOffered,
        uint256 amountWanted,
        uint256 duration
    )
        external
        override
        nonReentrant
        returns (uint256)
    {
        require(tokenOffered != address(0), "TradeConnect: Invalid offered token");
        require(tokenWanted != address(0), "TradeConnect: Invalid wanted token");
        require(amountOffered > 0, "TradeConnect: Invalid offered amount");
        require(amountWanted > 0, "TradeConnect: Invalid wanted amount");
        require(
            duration >= MIN_TRADE_DURATION && duration <= MAX_TRADE_DURATION,
            "TradeConnect: Invalid duration"
        );
        require(
            trustChain.calculateScore(msg.sender) >= MIN_TRUST_SCORE,
            "TradeConnect: Insufficient trust score"
        );

        IERC20 token = IERC20(tokenOffered);
        require(
            token.balanceOf(msg.sender) >= amountOffered,
            "TradeConnect: Insufficient balance"
        );
        require(
            token.allowance(msg.sender, address(this)) >= amountOffered,
            "TradeConnect: Insufficient allowance"
        );

        uint256 tradeId = tradeCount++;
        trades[tradeId] = Trade({
            maker: msg.sender,
            taker: address(0),
            tokenOffered: tokenOffered,
            tokenWanted: tokenWanted,
            amountOffered: amountOffered,
            amountWanted: amountWanted,
            deadline: block.timestamp + duration,
            status: TradeStatus.Active,
            createdAt: block.timestamp
        });

        userTrades[msg.sender].push(tradeId);
        
        // Transfere os tokens para o contrato
        token.transferFrom(msg.sender, address(this), amountOffered);
        
        emit TradeCreated(
            tradeId,
            msg.sender,
            tokenOffered,
            tokenWanted,
            amountOffered,
            amountWanted,
            block.timestamp + duration
        );

        return tradeId;
    }

    /**
     * @dev Aceita uma troca existente
     * @param tradeId ID da troca
     */
    function acceptTrade(uint256 tradeId)
        external
        override
        nonReentrant
        validTrade(tradeId)
        tradeActive(tradeId)
    {
        Trade storage trade = trades[tradeId];
        require(msg.sender != trade.maker, "TradeConnect: Cannot accept own trade");
        require(
            trustChain.calculateScore(msg.sender) >= MIN_TRUST_SCORE,
            "TradeConnect: Insufficient trust score"
        );

        IERC20 wantedToken = IERC20(trade.tokenWanted);
        require(
            wantedToken.balanceOf(msg.sender) >= trade.amountWanted,
            "TradeConnect: Insufficient balance"
        );
        require(
            wantedToken.allowance(msg.sender, address(this)) >= trade.amountWanted,
            "TradeConnect: Insufficient allowance"
        );

        // Transfere os tokens
        IERC20(trade.tokenOffered).transfer(msg.sender, trade.amountOffered);
        wantedToken.transferFrom(msg.sender, trade.maker, trade.amountWanted);

        trade.taker = msg.sender;
        trade.status = TradeStatus.Completed;
        userTrades[msg.sender].push(tradeId);

        emit TradeAccepted(tradeId, msg.sender);
    }

    /**
     * @dev Cancela uma troca existente
     * @param tradeId ID da troca
     */
    function cancelTrade(uint256 tradeId)
        external
        override
        nonReentrant
        validTrade(tradeId)
        onlyMaker(tradeId)
        tradeActive(tradeId)
    {
        Trade storage trade = trades[tradeId];
        trade.status = TradeStatus.Cancelled;

        // Devolve os tokens para o maker
        IERC20(trade.tokenOffered).transfer(trade.maker, trade.amountOffered);

        emit TradeCancelled(tradeId);
    }

    /**
     * @dev Retorna os detalhes de uma troca
     * @param tradeId ID da troca
     */
    function getTrade(uint256 tradeId)
        external
        view
        override
        validTrade(tradeId)
        returns (
            address maker,
            address taker,
            address tokenOffered,
            address tokenWanted,
            uint256 amountOffered,
            uint256 amountWanted,
            uint256 deadline,
            TradeStatus status,
            uint256 createdAt
        )
    {
        Trade memory trade = trades[tradeId];
        return (
            trade.maker,
            trade.taker,
            trade.tokenOffered,
            trade.tokenWanted,
            trade.amountOffered,
            trade.amountWanted,
            trade.deadline,
            trade.status,
            trade.createdAt
        );
    }

    /**
     * @dev Retorna as trocas de um usuário
     * @param user Endereço do usuário
     */
    function getUserTrades(address user)
        external
        view
        override
        returns (uint256[] memory)
    {
        return userTrades[user];
    }
} 