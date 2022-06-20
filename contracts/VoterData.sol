//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

contract VoterData {

    struct Data {
        uint identifier;
        bytes32 name;
    }

    mapping(uint => Data) public voterData;

    function addVoterData(uint _identifier, bytes32 _name) public {
        
    }
}