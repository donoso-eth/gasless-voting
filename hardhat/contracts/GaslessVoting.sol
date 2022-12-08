//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import {GelatoRelayContext} from "@gelatonetwork/relay-context/contracts/GelatoRelayContext.sol";

import {GelatoRelayContextERC2771} from "./gelato/GelatoRelayContextERC2771.sol";

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

struct ProposalState {
  uint256 positive;
  uint256 negative;
  uint256 proposalTimestamp;
  uint256 currentProposalId;
  bytes payload;
}

contract GaslessVoting is GelatoRelayContextERC2771 {

address immutable owner;

  // we only allow one proposal every 24 hours
  uint256 proposalValidity = 1 days;

  //prosalId
  uint256 currentProposalId;

  // Proposal init
  address gaslessProposing;

  // mapping
  mapping(uint256 => ProposalState) public proposalState;

  mapping(uint256 => mapping(address => bool)) alredyVotedById;

  constructor(address _gasslessProposing) {
    owner = msg.sender;
    gaslessProposing = _gasslessProposing;
  }


  //  @voting proposal
  function votingProposal(bool positive) external onlyGelatoRelay {
    address voter = _getMsgSender();

    _votingProposal(positive,voter);

    _transferRelayFee();
  }

  //
   function _votingProposal(bool positive, address voter) public {
  

    require(
      alredyVotedById[currentProposalId][voter] == false,
      "ALREADY_VOTED"
    );

    if (positive) {
      proposalState[currentProposalId].positive++;
    } else {
      proposalState[currentProposalId].negative++;
    }

    alredyVotedById[currentProposalId][voter] =true;

    
  }

  //
  function getProposalState() public view returns (ProposalState memory) {
    return proposalState[currentProposalId];
  }

  // @notice User external
  function _createProposal(
    uint256 _proposalId,
    bytes memory payload
  ) external onlyGaslessProposing {
    currentProposalId = _proposalId;

    proposalState[currentProposalId] = ProposalState(
      0,
      0,
      block.timestamp,
      _proposalId,
      payload
    );
  }

  receive() external payable {
    console.log("----- receive:", msg.value);
  }

  function withdraw() external onlyOwner returns (bool) {
    (bool result, ) = payable(msg.sender).call{value: address(this).balance}("");
    return result;
  }

//Modifiers
modifier onlyOwner () {
  require(msg.sender == owner,'ONLY_OWNER');
  _;
}

  modifier onlyGaslessProposing() {
    require(gaslessProposing == msg.sender, "ONLY_PROPOSING");
    _;
  }
}
