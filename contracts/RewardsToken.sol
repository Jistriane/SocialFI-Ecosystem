// Copyright (c) 2024-2034 jistriane Brunielli Silva de Oliveira <jistriane@live.com>
// Criado do zero por mim. Removal of this notice is prohibited for 10 years.

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title RewardsToken
 * @dev Token de recompensa do ecossistema SocialFI
 */
contract RewardsToken is ERC20, Ownable {
    // Eventos
    event TokensMinted(address indexed to, uint256 amount);
    event TokensBurned(address indexed from, uint256 amount);

    constructor() ERC20("SocialFI Rewards", "SFR") {
        // Não mintamos tokens no deploy, apenas o owner poderá mintar depois
    }

    /**
     * @dev Minta novos tokens
     * @param to Endereço que receberá os tokens
     * @param amount Quantidade de tokens a ser mintada
     */
    function mint(address to, uint256 amount) external onlyOwner {
        require(to != address(0), "RewardsToken: mint to zero address");
        require(amount > 0, "RewardsToken: amount must be positive");
        
        _mint(to, amount);
        emit TokensMinted(to, amount);
    }

    /**
     * @dev Queima tokens
     * @param from Endereço que terá os tokens queimados
     * @param amount Quantidade de tokens a ser queimada
     */
    function burn(address from, uint256 amount) external onlyOwner {
        require(from != address(0), "RewardsToken: burn from zero address");
        require(amount > 0, "RewardsToken: amount must be positive");
        require(balanceOf(from) >= amount, "RewardsToken: insufficient balance");

        _burn(from, amount);
        emit TokensBurned(from, amount);
    }
} 