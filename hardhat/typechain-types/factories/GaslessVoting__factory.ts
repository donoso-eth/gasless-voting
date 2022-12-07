/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import type { GaslessVoting, GaslessVotingInterface } from "../GaslessVoting";

const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "_gasslessroposing",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_proposalId",
        type: "uint256",
      },
    ],
    name: "_createProposal",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "getProposalState",
    outputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "positive",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "negative",
            type: "uint256",
          },
        ],
        internalType: "struct ProposalState",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "proposalState",
    outputs: [
      {
        internalType: "uint256",
        name: "positive",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "negative",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bool",
        name: "positive",
        type: "bool",
      },
    ],
    name: "votingProposal",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

const _bytecode =
  "0x608060405262015180600055600060025534801561001c57600080fd5b5060405161094838038061094883398101604081905261003b91610041565b5061006f565b600060208284031215610052578081fd5b81516001600160a01b0381168114610068578182fd5b9392505050565b6108ca8061007e6000396000f3fe608060405234801561001057600080fd5b506004361061004c5760003560e01c8063441a21eb14610051578063aade375b14610066578063c922e393146100bc578063d26331d4146100cf575b600080fd5b61006461005f36600461076d565b61010b565b005b604080518082018252600080825260209182018190526001805482526004835290839020835180850190945280548452015490820152604080518251815260209283015192810192909252015b60405180910390f35b6100646100ca3660046107ac565b61026a565b6100f66100dd3660046107ac565b6004602052600090815260409020805460019091015482565b604080519283526020830191909152016100b3565b73abcc9b596420a9e9172fd5938620e265a0f9df9233146101735760405162461bcd60e51b815260206004820152600f60248201527f6f6e6c7947656c61746f52656c6179000000000000000000000000000000000060448201526064015b60405180910390fd5b600154600090815260056020908152604080832060131936013560601c80855292529091205460ff16156101e95760405162461bcd60e51b815260206004820152600d60248201527f414c52454144595f564f54454400000000000000000000000000000000000000604482015260640161016a565b811561021657600154600090815260046020526040812080549161020c83610843565b919050555061023d565b60018054600090815260046020526040812090910180549161023783610843565b91905055505b600154600090815260056020908152604082206001600160a01b038416909252526102666102cd565b5050565b6003546001600160a01b031633146102c45760405162461bcd60e51b815260206004820152600e60248201527f4f4e4c595f50524f504f53494e47000000000000000000000000000000000000604482015260640161016a565b60015542600255565b6102f836605b19013560601c36603319013536604719013560601c6001600160a01b031691906102fa565b565b8061030457505050565b6001600160a01b03831673eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee146103415761033c6001600160a01b038416838361034b565b505050565b61033c82826103cb565b604080516001600160a01b038416602482015260448082018490528251808303909101815260649091019091526020810180517bffffffffffffffffffffffffffffffffffffffffffffffffffffffff167fa9059cbb0000000000000000000000000000000000000000000000000000000017905261033c9084906104e4565b8047101561041b5760405162461bcd60e51b815260206004820152601d60248201527f416464726573733a20696e73756666696369656e742062616c616e6365000000604482015260640161016a565b6000826001600160a01b03168260405160006040518083038185875af1925050503d8060008114610468576040519150601f19603f3d011682016040523d82523d6000602084013e61046d565b606091505b505090508061033c5760405162461bcd60e51b815260206004820152603a60248201527f416464726573733a20756e61626c6520746f2073656e642076616c75652c207260448201527f6563697069656e74206d61792068617665207265766572746564000000000000606482015260840161016a565b6000610539826040518060400160405280602081526020017f5361666545524332303a206c6f772d6c6576656c2063616c6c206661696c6564815250856001600160a01b03166105c99092919063ffffffff16565b80519091501561033c57808060200190518101906105579190610790565b61033c5760405162461bcd60e51b815260206004820152602a60248201527f5361666545524332303a204552433230206f7065726174696f6e20646964206e60448201527f6f74207375636365656400000000000000000000000000000000000000000000606482015260840161016a565b60606105d884846000856105e0565b949350505050565b6060824710156106585760405162461bcd60e51b815260206004820152602660248201527f416464726573733a20696e73756666696369656e742062616c616e636520666f60448201527f722063616c6c0000000000000000000000000000000000000000000000000000606482015260840161016a565b600080866001600160a01b0316858760405161067491906107c4565b60006040518083038185875af1925050503d80600081146106b1576040519150601f19603f3d011682016040523d82523d6000602084013e6106b6565b606091505b50915091506106c7878383876106d2565b979650505050505050565b6060831561073e578251610737576001600160a01b0385163b6107375760405162461bcd60e51b815260206004820152601d60248201527f416464726573733a2063616c6c20746f206e6f6e2d636f6e7472616374000000604482015260640161016a565b50816105d8565b6105d883838151156107535781518083602001fd5b8060405162461bcd60e51b815260040161016a91906107e0565b60006020828403121561077e578081fd5b813561078981610883565b9392505050565b6000602082840312156107a1578081fd5b815161078981610883565b6000602082840312156107bd578081fd5b5035919050565b600082516107d6818460208701610813565b9190910192915050565b60208152600082518060208401526107ff816040850160208701610813565b601f01601f19169190910160400192915050565b60005b8381101561082e578181015183820152602001610816565b8381111561083d576000848401525b50505050565b600060001982141561087c577f4e487b710000000000000000000000000000000000000000000000000000000081526011600452602481fd5b5060010190565b801515811461089157600080fd5b5056fea26469706673582212207398a63043c12d704add2ac498ecca12477c6e28311f78da35ed11007ce2d89864736f6c63430008040033";

type GaslessVotingConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: GaslessVotingConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class GaslessVoting__factory extends ContractFactory {
  constructor(...args: GaslessVotingConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  deploy(
    _gasslessroposing: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<GaslessVoting> {
    return super.deploy(
      _gasslessroposing,
      overrides || {}
    ) as Promise<GaslessVoting>;
  }
  getDeployTransaction(
    _gasslessroposing: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(_gasslessroposing, overrides || {});
  }
  attach(address: string): GaslessVoting {
    return super.attach(address) as GaslessVoting;
  }
  connect(signer: Signer): GaslessVoting__factory {
    return super.connect(signer) as GaslessVoting__factory;
  }
  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): GaslessVotingInterface {
    return new utils.Interface(_abi) as GaslessVotingInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): GaslessVoting {
    return new Contract(address, _abi, signerOrProvider) as GaslessVoting;
  }
}
