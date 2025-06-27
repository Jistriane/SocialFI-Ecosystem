// Copyright (c) 2024-2034 jistriane Brunielli Silva de Oliveira <jistriane@live.com>
// Criado do zero por mim. Removal of this notice is prohibited for 10 years.

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";
import "./interfaces/IGovGame.sol";
import "./interfaces/ITrustChain.sol";
import "./interfaces/ITradeConnect.sol";
import "./TrustChain.sol";

/**
 * @title GovGame
 * @dev Sistema de governança gamificada do ecossistema SocialFI
 * @author SocialFI Team
 */
contract GovGame is IGovGame, Ownable, ReentrancyGuard {
    // Estruturas
    struct Proposal {
        address proposer;
        string title;
        string description;
        string category;
        uint256 votesFor;
        uint256 votesAgainst;
        uint256 startTime;
        uint256 endTime;
        ProposalStatus status;
        mapping(address => VoteInfo) votes;
    }

    struct VoteInfo {
        bool hasVoted;
        bool support;
        uint256 votingPower;
        string reason;
        uint256 timestamp;
    }

    // Constantes
    uint256 public constant MIN_PROPOSAL_DURATION = 1 days;
    uint256 public constant MAX_PROPOSAL_DURATION = 7 days;
    uint256 public constant PROPOSAL_THRESHOLD = 100;
    uint256 public constant MIN_VOTING_POWER = 50;

    // Variáveis de estado
    ITrustChain public trustChain;
    IERC20 public rewardsToken;
    uint256 public proposalCount;
    mapping(uint256 => Proposal) public proposals;
    mapping(address => uint256[]) public userProposals;
    mapping(address => uint256[]) public userVotes;

    // Eventos
    event ProposalCreated(
        uint256 indexed id,
        address indexed proposer,
        string title,
        string description,
        string category,
        uint256 startTime,
        uint256 endTime
    );
    
    event VoteCast(
        uint256 indexed proposalId,
        address indexed voter,
        bool support,
        uint256 votingPower,
        string reason
    );
    
    event ProposalExecuted(
        uint256 indexed proposalId,
        ProposalStatus status
    );

    event ProposalCancelled(
        uint256 indexed proposalId
    );

    event RewardDistributed(
        uint256 indexed proposalId,
        address indexed voter,
        uint256 amount
    );

    modifier validProposal(uint256 proposalId) {
        require(proposalId < proposalCount, "GovGame: Invalid proposal ID");
        _;
    }

    constructor(address _trustChain, address _rewardsToken) {
        require(_trustChain != address(0), "GovGame: Invalid TrustChain address");
        require(_rewardsToken != address(0), "GovGame: Invalid RewardsToken address");
        trustChain = ITrustChain(_trustChain);
        rewardsToken = IERC20(_rewardsToken);
    }

    /**
     * @dev Cria uma nova proposta
     * @param _title Título da proposta
     * @param _description Descrição da proposta
     * @param _category Categoria da proposta
     */
    function createProposal(
        string memory _title,
        string memory _description,
        string memory _category
    )
        external
        override
        nonReentrant
        returns (uint256)
    {
        require(bytes(_title).length > 0, "GovGame: Empty title");
        require(bytes(_description).length > 0, "GovGame: Empty description");
        require(bytes(_category).length > 0, "GovGame: Empty category");
        require(
            trustChain.calculateScore(msg.sender) >= PROPOSAL_THRESHOLD,
            "GovGame: Insufficient trust score"
        );

        uint256 proposalId = proposalCount++;
        Proposal storage proposal = proposals[proposalId];
        proposal.proposer = msg.sender;
        proposal.title = _title;
        proposal.description = _description;
        proposal.category = _category;
        proposal.startTime = block.timestamp;
        proposal.endTime = block.timestamp + MIN_PROPOSAL_DURATION;
        proposal.status = ProposalStatus.Active;

        userProposals[msg.sender].push(proposalId);

        emit ProposalCreated(
            proposalId,
            msg.sender,
            _title,
            _description,
            _category,
            proposal.startTime,
            proposal.endTime
        );

        return proposalId;
    }

    /**
     * @dev Vota em uma proposta
     * @param _proposalId ID da proposta
     * @param _support Voto a favor (true) ou contra (false)
     * @param _reason Justificativa do voto
     */
    function vote(
        uint256 _proposalId,
        bool _support,
        string memory _reason
    )
        external
        override
        nonReentrant
        validProposal(_proposalId)
    {
        Proposal storage proposal = proposals[_proposalId];
        require(
            block.timestamp >= proposal.startTime &&
            block.timestamp <= proposal.endTime,
            "GovGame: Voting closed"
        );
        require(
            !proposal.votes[msg.sender].hasVoted,
            "GovGame: Already voted"
        );

        uint256 votingPower = calculateVotingPower(msg.sender);
        require(votingPower >= MIN_VOTING_POWER, "GovGame: Insufficient voting power");

        proposal.votes[msg.sender] = VoteInfo({
            hasVoted: true,
            support: _support,
            votingPower: votingPower,
            reason: _reason,
            timestamp: block.timestamp
        });

        if (_support) {
            proposal.votesFor += votingPower;
        } else {
            proposal.votesAgainst += votingPower;
        }

        userVotes[msg.sender].push(_proposalId);

        emit VoteCast(_proposalId, msg.sender, _support, votingPower, _reason);
    }

    /**
     * @dev Calcula o poder de voto de um usuário
     * @param _user Endereço do usuário
     */
    function calculateVotingPower(address _user)
        public
        view
        override
        returns (uint256)
    {
        return trustChain.calculateScore(_user);
    }

    /**
     * @dev Executa uma proposta após o término da votação
     * @param _proposalId ID da proposta
     */
    function executeProposal(uint256 _proposalId)
        external
        override
        nonReentrant
        validProposal(_proposalId)
    {
        Proposal storage proposal = proposals[_proposalId];
        require(
            block.timestamp > proposal.endTime,
            "GovGame: Voting still active"
        );
        require(
            proposal.status == ProposalStatus.Active,
            "GovGame: Already executed or cancelled"
        );

        if (proposal.votesFor > proposal.votesAgainst) {
            proposal.status = ProposalStatus.Succeeded;
            _distributeRewards(_proposalId, true);
        } else {
            proposal.status = ProposalStatus.Defeated;
            _distributeRewards(_proposalId, false);
        }

        emit ProposalExecuted(_proposalId, proposal.status);
    }

    /**
     * @dev Cancela uma proposta
     * @param _proposalId ID da proposta
     */
    function cancelProposal(uint256 _proposalId)
        external
        override
        validProposal(_proposalId)
    {
        Proposal storage proposal = proposals[_proposalId];
        require(
            msg.sender == proposal.proposer || msg.sender == owner(),
            "GovGame: Not authorized"
        );
        require(
            proposal.status == ProposalStatus.Active,
            "GovGame: Already executed or cancelled"
        );

        proposal.status = ProposalStatus.Cancelled;
        emit ProposalCancelled(_proposalId);
    }

    /**
     * @dev Distribui recompensas para os votantes do lado vencedor
     * @param proposalId ID da proposta
     * @param forVotes True se os votos a favor venceram
     */
    function _distributeRewards(uint256 proposalId, bool forVotes) internal {
        Proposal storage proposal = proposals[proposalId];
        uint256 totalVotes = forVotes ? proposal.votesFor : proposal.votesAgainst;
        uint256 rewardPool = 1000 * 10**18; // 1000 tokens de recompensa

        for (uint256 i = 0; i < userVotes[msg.sender].length; i++) {
            if (userVotes[msg.sender][i] == proposalId) {
                VoteInfo memory voteInfo = proposal.votes[msg.sender];
                if (voteInfo.support == forVotes) {
                    uint256 reward = (voteInfo.votingPower * rewardPool) / totalVotes;
                    rewardsToken.transfer(msg.sender, reward);
                    emit RewardDistributed(proposalId, msg.sender, reward);
                }
                break;
            }
        }
    }

    /**
     * @dev Retorna os detalhes de uma proposta
     * @param _proposalId ID da proposta
     */
    function getProposal(uint256 _proposalId)
        external
        view
        override
        validProposal(_proposalId)
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
        )
    {
        Proposal storage proposal = proposals[_proposalId];
        return (
            proposal.proposer,
            proposal.title,
            proposal.description,
            proposal.category,
            proposal.votesFor,
            proposal.votesAgainst,
            proposal.startTime,
            proposal.endTime,
            proposal.status
        );
    }

    /**
     * @dev Retorna o voto de um usuário em uma proposta
     * @param _proposalId ID da proposta
     * @param _voter Endereço do votante
     */
    function getVote(uint256 _proposalId, address _voter)
        external
        view
        override
        validProposal(_proposalId)
        returns (
            bool support,
            uint256 votingPower,
            string memory reason,
            uint256 timestamp
        )
    {
        VoteInfo memory voteInfo = proposals[_proposalId].votes[_voter];
        return (
            voteInfo.support,
            voteInfo.votingPower,
            voteInfo.reason,
            voteInfo.timestamp
        );
    }

    /**
     * @dev Retorna as propostas de um usuário
     * @param _user Endereço do usuário
     */
    function getUserProposals(address _user)
        external
        view
        override
        returns (uint256[] memory)
    {
        return userProposals[_user];
    }

    /**
     * @dev Retorna os votos de um usuário
     * @param _user Endereço do usuário
     */
    function getUserVotes(address _user)
        external
        view
        override
        returns (uint256[] memory)
    {
        return userVotes[_user];
    }
} 