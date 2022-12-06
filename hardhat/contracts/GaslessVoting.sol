//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import {GelatoRelayContext} from "@gelatonetwork/relay-context/contracts/GelatoRelayContext.sol";

import {GelatoRelayContextERC2771} from "@gelatonetwork/relay-context/contracts/GelatoRelayContextERC2771.sol";

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";


struct ProposalState {
  uint256 positive;
  uint256 negative;
  mapping(address=> bool) alredyVoted;
}

contract GaslessVoting is GelatoRelayContextERC2771 {
  // we only allow one proposal every 24 hours
  uint256 proposalValidity = 1 days;

  //prosalId
  uint256 currentProposalId;


  // Proposal init
  uint256 proposalTimestamp = 0;

  // Proposal init
  address gaslessProposing;


  // mapping
  mapping(uint256 => ProposalState) public proposalState;

  constructor(address _gasslessroposing) {}


 //  @voting proposal 
 function votingProposal(bool positive) external onlyGelatoRelay {

  address voter = _getMsgSender();

  require(proposalState[currentProposalId].alredyVoted[voter] == false, 'ALREADY_VOTED');

  if (positive) {
    proposalState[currentProposalId].positive ++;
  } else {
    proposalState[currentProposalId].negative++;
  }

  proposalState[currentProposalId].alredyVoted[voter] = true;

 _transferRelayFee();

 }



  // 


  // @notice User external
  function _createProposal(uint256 _proposalId) external onlyGaslessProposing {
 
    currentProposalId = _proposalId;
    proposalTimestamp = block.timestamp;
  }

  modifier onlyGaslessProposing() {
    require(gaslessProposing == msg.sender, "ONLY_PROPOSING");
    _;
  }
}
