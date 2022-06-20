//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

contract Voting {

    struct Candidate {
        uint candidateId;
        uint votes;
    }

    struct Detail {
        uint duration;
        Candidate[] candidates;
        uint startTime;
    }

    struct History {
        uint votingId;
        uint candidateId;
    }

    uint votingCount = 1;
    mapping(uint => Detail) public votingDetails;
    mapping(address => uint) public voterToCandidate;
    mapping(uint => address[]) public candidateToVoter;
    
    constructor(string memory _greeting) {
        
    }

    function startSession(uint _votingId, uint _duration) public{
        Detail storage details = votingDetails[_votingId];
        details.duration = _duration;
        details.startTime = block.timestamp;
    }

    function createVoting(uint _duration, uint _startTime, uint[] memory _candidates) public {
        Detail storage details = votingDetails[votingCount];
        details.duration = _duration;
        for(uint i; i < _candidates.length; i++) {
            details.candidates.push(Candidate(_candidates[i], 0));
        }
        details.startTime = _startTime;
        votingCount ++;
    }

    function vote(uint _votingId, address _voter, uint _candidate, address _user) public {
        Detail storage details = votingDetails[_votingId];
        require(voterToCandidate[_user] == 0, "You already voted to one of the candidates");
        require(details.startTime + details.duration > block.timestamp, "Duration of the voting session is over");
        uint index = getCandidateIndex(_votingId, _candidate);
        Candidate[] storage  candidates= votingDetails[_votingId].candidates;
        candidates[index].votes = candidates[index].votes + 1;
        voterToCandidate[_voter] = _candidate;

        candidateToVoter[_candidate].push(_user);
    }


    function getCandidateIndex(uint _votingId, uint _candidate) internal view returns(uint) {
        uint index;
        Candidate[] memory  candidates= votingDetails[_votingId].candidates;
        for(uint i; i < candidates.length; i++) {
            if(candidates[i].candidateId == _candidate) {
                index = i;
            }
        }
        
        return index;   
    }

}
