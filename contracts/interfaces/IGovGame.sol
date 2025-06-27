// Copyright (c) 2024-2034 jistriane Brunielli Silva de Oliveira <jistriane@live.com>
// Criado do zero por mim. Removal of this notice is prohibited for 10 years.

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

/**
 * @title IGovGame
 * @dev Interface para o contrato GovGame
 */
interface IGovGame {
    /**
     * @dev Cria uma nova proposta de governança
     * @param _title Título da proposta
     * @param _description Descrição detalhada da proposta
     * @param _category Categoria da proposta
     * @return uint256 ID da proposta criada
     */
    function createProposal(
        string memory _title,
        string memory _description,
        string memory _category
    ) external returns (uint256);

    /**
     * @dev Registra um voto em uma proposta
     * @param _proposalId ID da proposta
     * @param _support True para aprovar, False para rejeitar
     * @param _reason Justificativa do voto
     */
    function vote(
        uint256 _proposalId,
        bool _support,
        string memory _reason
    ) external;

    /**
     * @dev Calcula o poder de voto de um usuário
     * @param _user Endereço do usuário
     * @return uint256 Poder de voto calculado
     */
    function calculateVotingPower(address _user) external view returns (uint256);

    /**
     * @dev Executa uma proposta após o período de votação
     * @param _proposalId ID da proposta
     */
    function executeProposal(uint256 _proposalId) external;

    /**
     * @dev Cancela uma proposta
     * @param _proposalId ID da proposta
     */
    function cancelProposal(uint256 _proposalId) external;

    /**
     * @dev Retorna os detalhes de uma proposta
     * @param _proposalId ID da proposta
     */
    function getProposal(uint256 _proposalId)
        external
        view
        returns (
            address proposer,
            string memory title,
            string memory description,
            string memory category,
            uint256 votesFor,
            uint256 votesAgainst,
            uint256 startTime,
            uint256 endTime,
            ProposalStatus status
        );

    /**
     * @dev Retorna o voto de um usuário em uma proposta
     * @param _proposalId ID da proposta
     * @param _voter Endereço do votante
     */
    function getVote(uint256 _proposalId, address _voter)
        external
        view
        returns (
            bool support,
            uint256 votingPower,
            string memory reason,
            uint256 timestamp
        );

    /**
     * @dev Retorna as propostas de um usuário
     * @param _user Endereço do usuário
     */
    function getUserProposals(address _user)
        external
        view
        returns (uint256[] memory);

    /**
     * @dev Retorna os votos de um usuário
     * @param _user Endereço do usuário
     */
    function getUserVotes(address _user)
        external
        view
        returns (uint256[] memory);

    // Enums
    enum ProposalStatus {
        Active,
        Succeeded,
        Defeated,
        Executed,
        Cancelled
    }
} 