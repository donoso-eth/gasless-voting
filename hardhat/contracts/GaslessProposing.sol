//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

import {IGaslessVoting} from "./interfaces/IGaslessVoting.sol";

import {GelatoRelayContext} from "@gelatonetwork/relay-context/contracts/GelatoRelayContext.sol";


enum ProposalStatus {
  Ready,
  Voting
}

contract GaslessProposing is GelatoRelayContext {
  // owner
  address immutable owner;

  address gaslessVoting;

  // we only allow one proposal every 24 hours
  uint256 proposalValidity = 1 days;

  //prosalId
  uint256 proposalId = 0;

  // Initial Status
  ProposalStatus proposalStatus = ProposalStatus.Ready;

  // Proposal init
  uint256 proposalTimestamp = 0;

  // bytes
  bytes proposalBytes;

  constructor() {
    owner = msg.sender;
  }

  // @notice 
  // @dev external only Gelato relayer
  // @dev transfer Fee to Geato with _transferRelayFee();
  function createProposal(bytes calldata payload) external onlyGelatoRelay {
    require(
      proposalStatus == ProposalStatus.Ready,
      "OLD_PROPOSAL_STILL_ACTIVE"
    );

    _transferRelayFee();

    proposalId++;
    proposalStatus = ProposalStatus.Voting;
    proposalTimestamp = block.timestamp;
    proposalBytes = payload;
    IGaslessVoting(gaslessVoting)._createProposal(proposalId, payload);
  }

  function _createProposal(bytes calldata payload) public {
    require(
      proposalStatus == ProposalStatus.Ready,
      "OLD_PROPOSAL_STILL_ACTIVE"
    );
    proposalId++;
    proposalStatus = ProposalStatus.Voting;
    proposalTimestamp = block.timestamp;
    proposalBytes = payload;
    IGaslessVoting(gaslessVoting)._createProposal(proposalId, payload);
  }

  // Set voting Contract
  function setVotingContract(address _gaslessVoting) external onlyOwner {
    gaslessVoting = _gaslessVoting;
  }

  // View Funcitons
  function getStatus() public view returns (ProposalStatus) {
    return proposalStatus;
  }

  function getProposalTimestamp() public view returns (uint256) {
    return proposalTimestamp;
  }

  function getProposalBytes() public view returns (bytes memory) {
    return proposalBytes;
  }

  receive() external payable {
    console.log("----- receive:", msg.value);
  }

  function withdraw() external onlyOwner returns (bool) {
    (bool result, ) = payable(msg.sender).call{value: address(this).balance}(
      ""
    );
    return result;
  }

  //Modifiers
  modifier onlyOwner() {
    require(msg.sender == owner, "ONLY_OWNER");
    _;
  }
}
