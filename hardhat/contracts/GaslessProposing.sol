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

contract GaslessProposing is GelatoRelayContext {
  // owner
  address immutable owner;

  address gaslessVoting;

  // we only allow one proposal every 24 hours
  uint256 proposalValidity = 30 minutes;

  //prosalId
  uint256 proposalId = 0;

  // Initial Status
  ProposalStatus proposalStatus = ProposalStatus.Ready;

  // Proposal init
  uint256 proposalTimestamp = 0;

  // bytes
  bytes proposalBytes;


    //// GELATO
    IOps public ops;
    address payable public gelato;
    address public constant ETH = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;
    bytes32 public balanceTreasuryTask;


  constructor(IOps _ops) {
    ops = _ops;
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

    createFinishVotingTask();
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


  // #region  ========== =============  GELATO OPS AUTOMATE CLOSING PROPOSAL  ============= ============= //

    function createFinishVotingTask () internal returns (bytes32 taskId) {
    bytes memory timeArgs = abi.encode(uint128(block.timestamp + proposalValidity), proposalValidity);

    bytes memory execData = abi.encodeWithSelector(this.finishVoting.selector);

    LibDataTypes.Module[] memory modules = new LibDataTypes.Module[](2);

    modules[0] = LibDataTypes.Module.TIME;
    modules[1] = LibDataTypes.Module.SINGLE_EXEC;

    bytes[] memory args = new bytes[](1);

    args[0] = timeArgs;

    LibDataTypes.ModuleData memory moduleData = LibDataTypes.ModuleData(modules, args);

    taskId = IOps(ops).createTask(address(this), execData, moduleData, ETH);
   }

  function finishVoting() public onlyOps {
    (uint256 fee, address feeToken) = IOps(ops).getFeeDetails();

    transfer(fee, feeToken);
  }

  function transfer(uint256 _amount, address _paymentToken) internal {
    // _transfer(_amount, _paymentToken);
    // callInternal(abi.encodeWithSignature("_transfer(uint256,address)", _amount, _paymentToken));
    (bool success, ) = gelato.call{value: _amount}("");
    require(success, "_transfer: ETH transfer failed");
  }

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
