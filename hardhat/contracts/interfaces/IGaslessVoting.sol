//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";

enum ProposalStatus {
  Ready,
  Voting
}

interface IGaslessVoting {


// @notice User external 
function _createProposal(uint256 _proposalId, bytes memory payload) external;

function _finishProposal() external;

}
