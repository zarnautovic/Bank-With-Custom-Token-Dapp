// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import "./ZCoinContract.sol";

contract Bank {
    address public bankOwner;
    string public name;
    mapping(address => uint256) public customerDeposit;
    mapping(address => uint256) public customerDebts;
    ZCoin public ZCoinContract;

    event tokensBorrowed(address indexed owner, uint256 amount, string message);
    event tokensDeposited(
        address indexed owner,
        uint256 amount,
        string message
    );

    constructor(address _zCoinAddress) {
        bankOwner = msg.sender;
        ZCoinContract = ZCoin(_zCoinAddress);
    }

    function borrowMoney(uint256 value) public {
        require(value > 0, "You need to borrow some amount of ZCoin");
        require(
            value < 1000 * 10**ZCoinContract.decimals(),
            "You can't borrow more than 1000 of ZCoin"
        );
        ZCoinContract.transfer(msg.sender, value);
        customerDebts[msg.sender] += value;

        emit tokensBorrowed(msg.sender, value, "Tokens borrowed.");
    }

    function depositMoney(uint256 value) public {
        require(value > 0, "You need to sell at least some tokens");
        ZCoinContract.transferFrom(msg.sender, address(this), value);
        customerDeposit[msg.sender] += value;

        emit tokensDeposited(msg.sender, value, "Tokens deposited.");
    }

    function getCustomerDebts() external view returns (uint256) {
        return customerDebts[msg.sender];
    }

    function getCustomerDeposit() external view returns (uint256) {
        return customerDeposit[msg.sender];
    }
}
