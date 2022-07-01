//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

contract VoterData {
    struct Data {
        uint identifier;
        bytes32 name;
    }

    mapping(uint => Data[]) private voterData;

    function addVoterData(uint _votingId, uint _identifier, bytes32 _name) public {
        Data[] storage voters = voterData[_votingId];
        voters.push(Data(_identifier, _name));
    }

    function validate(uint _votingId, uint _identifier, bytes32 _name) public view returns(bool){
        bool validation;
        Data[] memory voters = voterData[_votingId];
        for(uint i; i < voters.length; i++) {
            if(voters[i].identifier == _identifier && voters[i].name == _name) {
                validation = true;
            } else {
                validation = false;
            }
        }

        return validation;
    }

    function getVoterDataIndex(uint _votingId, uint _identifier, bytes32 _name) public view returns(uint){
        uint index;
        Data[] memory voters = voterData[_votingId];
        for(uint i; i < voters.length; i++) {
            if(voters[i].identifier == _identifier && voters[i].name == _name) {
                index = i;
            }
        }
        
        return index;  
    }
}