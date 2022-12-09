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

interface IGaslessVoting {


// @notice User external 
function _createProposal(uint256 _proposalId, bytes memory payload) external;

function _finishProposal() external;

}
