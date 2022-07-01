// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import '@openzeppelin/contracts/access/Ownable.sol';

contract BallotToken is ERC20,Ownable {
    constructor(address _voting) ERC20("Ballot", "BLT") {
        _mint(_voting, 1000000000 * 10 ** 18);
    }  
}