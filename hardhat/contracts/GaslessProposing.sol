//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

import {IGaslessVoting} from "./interfaces/IGaslessVoting.sol";

import {GelatoRelayContext} from "@gelatonetwork/relay-context/contracts/GelatoRelayContext.sol";

import {IOps} from "./gelato/IOps.sol";
import {LibDataTypes} from "./gelato/LibDataTypes.sol";

enum ProposalStatus {
  Ready,
  Voting
}

struct Proposal {
   ProposalStatus proposalStatus ;
   bytes32 taskId;
    uint256 proposalId;
}


contract GaslessProposing is GelatoRelayContext {

  event ProposalCreated(bytes32 taskId);


  // owner
  address immutable owner;

  address gaslessVoting;

  // we only allow one proposal every 24 hours
  uint256 proposalValidity = 30 minutes;

  //prosalId
  uint256 proposalId = 0;

  // Initial Status
  Proposal proposal;

  // Proposal init
  uint256 proposalTimestamp = 0;

  // bytes
  bytes proposalBytes;

  //// GELATO
  IOps public ops;
  address payable public gelato;
  address public constant ETH = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;
  bytes32 public finishingVotingTask;

  constructor(IOps _ops) {
    ops = _ops;
    owner = msg.sender;
    proposal.proposalStatus = ProposalStatus.Ready;
  }

  // @notice
  // @dev external only Gelato relayer
  // @dev transfer Fee to Geato with _transferRelayFee();
  function createProposal(bytes calldata payload) external onlyGelatoRelay {
    require(
      proposal.proposalStatus == ProposalStatus.Ready,
      "OLD_PROPOSAL_STILL_ACTIVE"
    );

    _transferRelayFee();

    proposalId++;
    proposal.proposalStatus = ProposalStatus.Voting;
    proposal.proposalId = proposalId;
    proposalTimestamp = block.timestamp;
    proposalBytes = payload;
    IGaslessVoting(gaslessVoting)._createProposal(proposalId, payload);

   finishingVotingTask =  createFinishVotingTask();
   proposal.taskId = finishingVotingTask;
    emit ProposalCreated(finishingVotingTask);
  }


  // #region  ========== =============  GELATO OPS AUTOMATE CLOSING PROPOSAL  ============= ============= //

  //@dev creating the  gelato task
  function createFinishVotingTask() internal returns (bytes32 taskId) {
    bytes memory timeArgs = abi.encode(
      uint128(block.timestamp + proposalValidity),
      proposalValidity
    );

    //@dev executing function encoded
    bytes memory execData = abi.encodeWithSelector(this.finishVoting.selector);

    LibDataTypes.Module[] memory modules = new LibDataTypes.Module[](2);

    //@dev using execution prefixed at a certain interval and soing only one execution
    modules[0] = LibDataTypes.Module.TIME;
    modules[1] = LibDataTypes.Module.SINGLE_EXEC;

    bytes[] memory args = new bytes[](1);

    args[0] = timeArgs;

    LibDataTypes.ModuleData memory moduleData = LibDataTypes.ModuleData(
      modules,
      args
    );

    //@dev  task creation
    taskId = IOps(ops).createTask(address(this), execData, moduleData, ETH);
  }

  //@dev executing function to be called by Gelato
  function finishVoting() public onlyOps {
    (uint256 fee, address feeToken) = IOps(ops).getFeeDetails();

    transfer(fee, feeToken);
    proposal.proposalStatus = ProposalStatus.Ready;
    IGaslessVoting(gaslessVoting)._finishProposal();

  }

  //@dev transfer fees to Gelato
  function transfer(uint256 _amount, address _paymentToken) internal {
    (bool success, ) = gelato.call{value: _amount}("");
    require(success, "_transfer: ETH transfer failed");
  }

  //@dev only Gelato modifier
  modifier onlyOps() {
    require(msg.sender == address(ops), "OpsReady: onlyOps");
    _;
  }

  // #endregion  ========== =============  GELATO OPS AUTOMATE CLOSING PROPOSAL  ============= ============= //

  //region ========== =============  ADMIN  ============= ============= //

  // Set voting Contract
  function setVotingContract(address _gaslessVoting) external onlyOwner {
    gaslessVoting = _gaslessVoting;
  }

  // View Funcitons
  function getStatus() public view returns (Proposal memory) {
    return proposal;
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
