import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { BigNumber, Contract, utils } from 'ethers';
import { DappBaseComponent } from '../dapp-injector/classes';
import { DappInjector } from '../dapp-injector/dapp-injector.service';
import { GaslessProposing } from 'src/assets/contracts/interfaces/GaslessProposing';
import GaslessPoposingMetadata from 'src/assets/contracts/gasless_proposing_metadata.json';
import { Web3Actions } from 'angular-web3';
import {
  GaslessVoting,
  ProposalStateStructOutput,
} from 'src/assets/contracts/interfaces/GaslessVoting';
import GaslessVotingMetadata from 'src/assets/contracts/gasless_voting_metadata.json';
import { MessageService } from 'primeng/api';

import { GelatoRelaySDK } from '@gelatonetwork/relay-sdk';
import { blockTimeToTime } from '../shared/helpers/helpers';

export interface IPROPOSAL {
  name: string;
  description: string;
  positive: number;
  negative: number;
  result: boolean;
  finish: number;
  taskId:string
}

@Component({
  selector: 'app-gasless-proposing',
  templateUrl: './gasless-proposing.component.html',
  styleUrls: ['./gasless-proposing.component.scss'],
})
export class GaslessProposingComponent extends DappBaseComponent {
  proposalForm: FormGroup;
  readyToPropose = false;
  nameProposal!: string;
  descriptionProposal!: string;
  positiveVotes = 0;
  negativeVotes = 0;

  activeProposal!: IPROPOSAL;
  lastProposals: { [key: number]: IPROPOSAL } = {};
  currentLastProposal!: number;

  readGaslessProposing!: GaslessProposing;
  gaslessProposing!: GaslessProposing;

  readGaslessVoting!: GaslessVoting;
  gaslessVoting!: GaslessVoting;

  abiCoder: utils.AbiCoder;
  lastActiveProposal: number = 0;

  constructor(
    dapp: DappInjector,
    store: Store,
    public formBuilder: FormBuilder,
    public router: Router,
    public messageService: MessageService
  ) {
    super(dapp, store);
    this.proposalForm = this.formBuilder.group({
      nameCtrl: ['', [Validators.required]],
      descriptionCtrl: ['', [Validators.required]],
    });
    this.store.dispatch(Web3Actions.chainBusy({ status: true }));
    this.abiCoder = new utils.AbiCoder();
    this.instantiateReadContract();
  }

  blockTimeToTime = blockTimeToTime;

  async instantiateReadContract() {
    let provider = await this.dapp.providerInitialization();
    this.readGaslessProposing = new Contract(
      GaslessPoposingMetadata.address,
      GaslessPoposingMetadata.abi,
      provider
    ) as GaslessProposing;

    this.readGaslessProposing.on('ProposalCreated', (taskId) => {
      this.getState();
    });

    this.readGaslessProposing.on('ProposalFinished', () => {
      this.getState();
    });


    this.readGaslessVoting = new Contract(
      GaslessVotingMetadata.address,
      GaslessVotingMetadata.abi,
      provider
    ) as GaslessVoting;

    this.readGaslessVoting.on('ProposalVoted', () => {
      this.getState();
    });


    this.getState();
  }

  async createProposal() {
    if (!this.readyToPropose) {
      alert('Not able to create proposals while one is running');
    }

    this.store.dispatch(Web3Actions.chainBusy({ status: true }));
    this.store.dispatch(Web3Actions.chainBusyWithMessage({message: {body:'Waiting for the relayer relayer ', header:'Sending Gasless Transaction'}}))
    let name = this.proposalForm.controls.nameCtrl.value;
    let description = this.proposalForm.controls.descriptionCtrl.value;

    let payload = this.abiCoder.encode(
      ['string', 'string'],
      [name, description]
    );

    const feeToken = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';
    const { data } =
      await this.readGaslessProposing.populateTransaction.createProposal(
        payload
      );

    // populate the relay SDK request body
    const request = {
      chainId: 5, // Goerli in this case
      target: this.readGaslessProposing.address, // target contract address
      data: data!, // encoded transaction datas
      isRelayContext: true, // are we using context contracts
      feeToken: feeToken, // token to pay the relayer
    };

    // send relayRequest to Gelato Relay API
    const relayResponse = await GelatoRelaySDK.relayWithSyncFee(request);
    console.log(relayResponse);
    let taskId = relayResponse.taskId
    this.store.dispatch(Web3Actions.chainBusyWithMessage({message: {body:`Transaction relayed On chain <br>  <a target="_blank" href="https://relay.gelato.digital/tasks/status/${taskId}">status</a>  `, header:'Waiting On-Chain execution'}}))
  
  }

  async vote(value: boolean) {
    try {
      this.store.dispatch(Web3Actions.chainBusy({ status: true }));
      this.store.dispatch(Web3Actions.chainBusyWithMessage({message: {body:'Waiting for the relayer relayer ', header:'Sending Gasless Transaction'}}))
 

      const { data } =
        await this.gaslessVoting.populateTransaction.votingProposal(value);

      const request = {
        chainId: 5, // Goerli in this case
        target: this.readGaslessVoting.address, // target contract address
        data: data!, // encoded transaction datas
        user: this.dapp.signerAddress!, //user sending the trasnaction
      };

      const sponsorApiKey = '1NnnocBNgXnG1VgUnFTHXmUICsvYqfjtKsAq1OCmaxk_';

      const relayResponse = await GelatoRelaySDK.relayWithSponsoredUserAuthCall(
        request,
        this.dapp.DAPP_STATE.defaultProvider,
        sponsorApiKey
      );

      console.log(relayResponse);

    let taskId = relayResponse.taskId
    this.store.dispatch(Web3Actions.chainBusyWithMessage({message: {body:`Transaction relayed On chain <br>  <a target="_blank" href="https://relay.gelato.digital/tasks/status/${taskId}">status</a>  `, header:'Waiting On-Chain execution'}}))

    } catch (error) {
      this.messageService.add({
        severity: 'info',
        summary: 'Info',
        detail: 'Message Content',
      });
      alert('only one vote per user');
      this.store.dispatch(Web3Actions.chainBusy({ status: false }));
    }
  }

  async getState() {
    this.store.dispatch(Web3Actions.chainBusy({ status: true }));

    let proposal = await this.readGaslessProposing.getStatus();

    console.log(proposal);

    this.readyToPropose = proposal.proposalStatus == 0 ? true : false;

    //// get last active proposal
    this.currentLastProposal =
      this.readyToPropose == true
        ? +proposal.proposalId.toString()
        : +proposal.proposalId.toString() - 1;

    if (this.lastProposals[this.currentLastProposal] === undefined && this.currentLastProposal != 0) {
      let result = (await this.readGaslessVoting.getProsalStateById(
        this.currentLastProposal
      )) as ProposalStateStructOutput;

      let [nameProposal, descriptionProposal] = this.abiCoder.decode(
        ['string', 'string'],
        result.payload
      );

      this.lastProposals[this.currentLastProposal] = {
        positive: +result.positive.toString(),
        negative: +result.negative.toString(),
        name: nameProposal,
        description: descriptionProposal,
        result: true,
        finish: +result.proposalTimestamp.toString(),
        taskId: proposal.taskId
      };
    }

    if (this.readyToPropose == false) {
      let result =
        (await this.readGaslessVoting.getProposalState()) as ProposalStateStructOutput;

     

      let [nameProposal, descriptionProposal] = this.abiCoder.decode(
        ['string', 'string'],
        result.payload
      );

      this.activeProposal = {
        positive: +result.positive.toString(),
        negative: +result.negative.toString(),
        name: nameProposal,
        description: descriptionProposal,
        result: true,
        finish: +result.proposalTimestamp.toString(),
        taskId: proposal.taskId
      };

      this.store.dispatch(Web3Actions.chainBusy({ status: false }));
    } else {
      this.store.dispatch(Web3Actions.chainBusy({ status: false }));
    }
  }

  override async hookContractConnected(): Promise<void> {
    let signer = this.dapp.signer!;

    this.gaslessProposing = new Contract(
      GaslessPoposingMetadata.address,
      GaslessPoposingMetadata.abi,
      signer
    ) as GaslessProposing;

    this.gaslessVoting = new Contract(
      GaslessVotingMetadata.address,
      GaslessVotingMetadata.abi,
      signer
    ) as GaslessVoting;

    this.getState();
  }
}
