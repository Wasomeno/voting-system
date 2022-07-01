//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./IVoterData.sol";

contract Voting {

    struct Candidate {
        uint candidateId;
        bytes32 candidate;
        uint votes;
    }

    struct Detail {
        bytes32 title;
        uint duration;
        Candidate[] candidates;
        uint startTime;
        uint roomId;
        address proposer;
    }

    struct History {
        address voter;
        uint candidateId;
        uint timeStamp;
    }


    uint public votingCount = 1;
    IERC20 ballotInterface;
    IVoterData voterDataInterface;
    mapping(uint => Detail) public votingDetails;
    mapping(uint => History[]) public votingHistory;
    mapping(uint => address[]) public voterVerified;

    function setInterface(address _ballotToken, address _voterData) public {
        ballotInterface = IERC20(_ballotToken);
        voterDataInterface = IVoterData(_voterData);
    }

    function startSession(uint _votingId, uint _duration) public{
        Detail storage details = votingDetails[_votingId];
        details.duration = _duration;
        details.startTime = block.timestamp;
    }

    function createVoting(bytes32 _title, uint _duration, uint _startTime, uint _roomId, bytes32[] calldata _candidates) public{
        Detail storage details = votingDetails[votingCount];
        details.title = _title;
        details.duration = _duration;
        for(uint i; i < _candidates.length; ++i) {
            details.candidates.push(Candidate(i + 1,_candidates[i], 0));
        }
        details.startTime = (_startTime * 1 hours) + block.timestamp;
        details.roomId = _roomId;
        details.proposer = msg.sender;
        votingCount ++;
    }

    function vote(uint _votingId, address _voter, uint _candidate) public {
        Detail storage details = votingDetails[_votingId];
        bool verified = checkVerifiedVoter(_votingId, _voter);
        bool voted = checkVoterVote(_votingId, _voter);
        uint duration = details.startTime + (details.duration * 1 hours);
        require(verified == true, "You are not verified");
        require(voted == false, "You already voted to one of the candidates");
        require(details.startTime < block.timestamp, "Voting session has not started");
        require(duration > block.timestamp, "Duration of the voting session is over");
        uint index = getCandidateIndex(_votingId, _candidate);
        ballotInterface.approve(_voter, 1);
        ballotInterface.transfer(address(this), 1);
        Candidate[] storage  candidates= votingDetails[_votingId].candidates;
        candidates[index].votes = candidates[index].votes + 1;
        votingHistory[_votingId].push(History(_voter, _candidate, block.timestamp));

        voterDataInterface.addVoterHistory(_voter, _votingId, _candidate, block.timestamp);
    }


    function getCandidateIndex(uint _votingId, uint _candidate) internal view returns(uint) {
        uint index;
        Candidate[] memory  candidates= votingDetails[_votingId].candidates;
        for(uint i; i < candidates.length; ++i) {
            if(candidates[i].candidateId == _candidate) {
                index = i;
            }
        }
        
        return index;   
    }

    function getCandidates(uint _votingId) public view returns(Candidate[] memory) {
        Candidate[] memory  candidates= votingDetails[_votingId].candidates;
        return candidates;
    }

    function getHistory(uint _votingId) public view returns(History[] memory) {
        History[] memory history = votingHistory[_votingId];
        return history;
    }

    function checkVerifiedVoter(uint _votingId, address _voter) public view returns(bool) {
        bool result;
        address[] memory verified = voterVerified[_votingId];
        for(uint i; i < verified.length; ++i) {
            if(verified[i] ==_voter) {
                result = true;
            } else {
                result = false;
            }
        }

        return result;
    }
    
    function checkVoterVote(uint _votingId, address _voter) public view returns(bool) {
        bool result;
        History[] memory votes = votingHistory[_votingId];
        for(uint i; i < votes.length; i++){
            if(votes[i].voter == _voter){
                result = true;
            } else {
                result = false;
            }
        }
        return result;
    }

    function verifyVoter(uint _votingId, bytes32[] calldata proof, bytes32 leaf) public {
        bool verify = voterDataInterface.verify(_votingId, proof, leaf);
        bool verified = checkVerifiedVoter(_votingId, msg.sender);
        require(verify == true, "You are not a verified voter");
        require(verified == false, "You are already verified");
        voterVerified[_votingId].push(msg.sender);
        ballotInterface.approve(address(this), 1);
        ballotInterface.transferFrom(address (this), msg.sender, 1);
    }

}
