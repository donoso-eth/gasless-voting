//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import {
    GelatoRelayContext
} from "@gelatonetwork/relay-context/contracts/GelatoRelayContext.sol";

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

enum ProposalStatus {
  Ready,
  Voting
}

contract GaslessProposing is GelatoRelayContext{

// we only allow one proposal every 24 hours
uint256 proposalValidity = 1 days;

//prosalId
uint256 proposalId = 0;

// Initial Status
ProposalStatus proposalStatus = ProposalStatus.Ready;


// Proposal init
uint256 proposalTimestamp = 0;

constructor() {}


// @notice User external 
function createProposal(bytes calldata title, bytes calldata description) external  onlyGelatoRelay {

  _createProposal(title,description)

  _transferRelayFee();

 

}

function _createProposal(bytes calldata title, bytes calldata description) public {
  require(proposalStatus == ProposalStatus.Ready, 'OLD_PROPOSAL_STILL_ACTIVE');
  proposalId++;
  proposalStatus = ProposalStatus.Voting;
  proposalTimestamp = block.timestamp;

}

// View Funcitons
function getStatus() public view returns (ProposalStatus) {
  return proposalStatus;
}

function getProposalTimestamp() public view returns (uint256) {
  return proposalTimestamp;
}



}
