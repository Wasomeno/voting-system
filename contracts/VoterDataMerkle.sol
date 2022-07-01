//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

contract VoterDataMerkle {

    struct History {
        uint votingId;
        uint candidateId;
        uint timeStamp;
    }
    
    mapping(uint => bytes32) public votingToRoot;
    mapping(uint => bytes32[]) public votingToLeaves;
    mapping(address => History[]) public voterHistory;

    function addLeaf(uint _votingId, bytes32 _leaf, bytes32 _newRoot) public {
        bytes32 defaultValue = 0xcfee7c08a98f4b565d124c7e4e28acc52e1bc780e3887db0a02a7d2d5bc66728;
        bool result = checkLeaf(_votingId, _leaf);
        require(result == true, "The same leaf already added to the tree");
        votingToLeaves[_votingId].push(_leaf);
        votingToLeaves[_votingId].push(defaultValue);
        setRoot(_votingId, _newRoot);
    }

    function setRoot(uint _votingId, bytes32 _root) public {
        votingToRoot[_votingId] = _root;
    }

    function checkLeaf(uint _votingId, bytes32 _leaf) public view returns(bool){
        bool result;
        bytes32[] memory leaves = votingToLeaves[_votingId];
        if(leaves.length == 0) {
            result = true;
        } else {
            for(uint i; i < leaves.length; i++ ) {
            if(leaves[i] != _leaf) {
                result = true;
                }
            }
        }
        
        return result;
    }

    function getLeaves(uint _votingId) public view returns(bytes32[] memory) {
        bytes32[] memory leaves = votingToLeaves[_votingId];
        return leaves;
    }
    
    function verify(uint _votingId, bytes32[] calldata proof, bytes32 leaf) public view returns(bool){
        bytes32 root = votingToRoot[_votingId];
        return MerkleProof.verify(proof, root, leaf);
    }

    function addVoterHistory(address _voter, uint _votingId, uint _candidateId, uint _timeStamp) public{
        voterHistory[_voter].push(History(_votingId, _candidateId, _timeStamp));
    }

    function getVoterHistory(address _voter) public view returns(History[] memory) {
        History[] memory history = voterHistory[_voter];
        return history;
    }

}