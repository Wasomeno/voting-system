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

    function setInterface(address _ballotToken, address _voterData) external {
        ballotInterface = IERC20(_ballotToken);
        voterDataInterface = IVoterData(_voterData);
    }

    function startSession(uint _votingId, uint _duration) public{
        Detail storage details = votingDetails[_votingId];
        details.duration = _duration;
        details.startTime = block.timestamp;
    }

    function createVoting(bytes32 _title, uint _duration, uint _startTime, uint _roomId, bytes32[] calldata _candidates) external{
        Detail storage details = votingDetails[votingCount];
        details.title = _title;
        details.duration = _duration;
        uint length = _candidates.length;
        for(uint i; i < length; ++i) {
            bytes32 candidate = _candidates[i];
            details.candidates.push(Candidate(i + 1, candidate, 0));
        }
        details.startTime = (_startTime * 1 hours) + block.timestamp;
        details.roomId = _roomId;
        details.proposer = msg.sender;
        votingCount ++;
    }

    function vote(uint _votingId, address _voter, uint _candidate) external {
        Detail memory details = votingDetails[_votingId];
        bool verified = checkVerifiedVoter(_votingId, _voter);
        bool voted = checkVoterVote(_votingId, _voter);
        uint startTime = details.startTime;
        uint duration = details.duration;
        uint totalDuration = startTime + (duration * 1 hours);

        require(verified == true, "You are not verified");
        require(voted == false, "You already voted to one of the candidates");
        require(startTime < block.timestamp, "Voting session has not started");
        require(totalDuration > block.timestamp, "Duration of the voting session is over");
        uint index = getCandidateIndex(_votingId, _candidate);
        ballotInterface.approve(_voter, 1);
        ballotInterface.transfer(address(this), 1);
        Candidate[] storage  candidates= votingDetails[_votingId].candidates;
        candidates[index].votes = candidates[index].votes + 1;
        votingHistory[_votingId].push(History(_voter, _candidate, block.timestamp));

        voterDataInterface.addVoterHistory(_voter, _votingId, _candidate, block.timestamp);
    }


    function getCandidateIndex(uint _votingId, uint _candidate) internal view returns(uint index) {
        Candidate[] memory  candidates= votingDetails[_votingId].candidates;
        uint length = candidates.length;
        for(uint i; i < length; ++i) {
            uint candidate = candidates[i].candidateId;
            if(candidate == _candidate) {
                index = i;
            }
        }  
    }

    function getCandidates(uint _votingId) external view returns(Candidate[] memory candidates) {
        candidates = votingDetails[_votingId].candidates;
    }

    function getHistory(uint _votingId) external view returns(History[] memory history) {
        history = votingHistory[_votingId];
    }

    function checkVerifiedVoter(uint _votingId, address _voter) internal view returns(bool result) {
        address[] memory verified = voterVerified[_votingId];
        uint length = verified.length;
        for(uint i; i < length; ++i) {
            address _verified = verified[i];
            if(_verified ==_voter) {
                result = true;
            } else {
                result = false;
            }
        }
    }
    
    function checkVoterVote(uint _votingId, address _voter) internal view returns(bool result) {
        History[] memory votes = votingHistory[_votingId];
        uint length = votes.length;
        for(uint i; i < length; i++){
            address voter = votes[i].voter;
            if(voter == _voter){
                result = true;
            } else {
                result = false;
            }
        }
    }

    function verifyVoter(uint _votingId, bytes32[] calldata proof, bytes32 leaf) external {
        bool verify = voterDataInterface.verify(_votingId, proof, leaf);
        bool verified = checkVerifiedVoter(_votingId, msg.sender);
        require(verify, "You are not a verified voter");
        require(!verified, "You are already verified");
        voterVerified[_votingId].push(msg.sender);
        ballotInterface.approve(address(this), 1);
        ballotInterface.transferFrom(address (this), msg.sender, 1);
    }

}
