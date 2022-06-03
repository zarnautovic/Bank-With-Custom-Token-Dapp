// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

contract ZCoin is ERC20, Ownable, ERC20Burnable {
    event tokensBurned(address indexed owner, uint256 amount, string message);
    event tokensMinted(address indexed owner, uint256 amount, string message);
    event additionalTokensMinted(
        address indexed owner,
        uint256 amount,
        string message
    );

    constructor(uint256 _initialSupply) ERC20("ZCoin", "ZCN") {
        _mint(msg.sender, _initialSupply * 10**decimals());
        emit tokensMinted(
            msg.sender,
            _initialSupply * 10**decimals(),
            "Initial supply of tokens minted."
        );
    }

    function mint(address account, uint256 amount) public onlyOwner {
        _mint(account, amount);
        emit additionalTokensMinted(
            msg.sender,
            amount,
            "Additional tokens minted."
        );
    }

    function burn(uint256 amount) public override onlyOwner {
        _burn(msg.sender, amount);
        emit tokensBurned(msg.sender, amount, "Tokens burned.");
    }
}
