//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "./VoterDataMerkle.sol";
interface IVoterData {
    function verify(uint _votingId, bytes32[] calldata proof, bytes32 leaf) external view returns(bool);
    function addVoterHistory(address _voter, uint _votingId, uint _candidateId, uint _timeStamp) external;
}