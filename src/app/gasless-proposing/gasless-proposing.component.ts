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

@Component({
  selector: 'app-gasless-proposing',
  templateUrl: './gasless-proposing.component.html',
  styleUrls: ['./gasless-proposing.component.scss'],
})
export class GaslessProposingComponent extends DappBaseComponent {
  proposalForm: FormGroup;
  readyToPropose = false;
  lastProposalTimestamp = 0;
  nameProposal!: string;
  descriptionProposal!: string;
  positiveVotes = 0;
  negativeVotes = 0;

  readGaslessProposing!: GaslessProposing;
  gaslessProposing!: GaslessProposing;

  readGaslessVoting!: GaslessVoting;
  gaslessVoting!: GaslessVoting;

  abiCoder: utils.AbiCoder;

  constructor(
    dapp: DappInjector,
    store: Store,
    public formBuilder: FormBuilder,
    public router: Router,
    public messageService: MessageService
  ) {
    super(dapp, store);
    this.proposalForm = this.formBuilder.group({
      nameCtrl: ['test', [Validators.required]],
      descriptionCtrl: ['test2', [Validators.required]],
    });
    this.store.dispatch(Web3Actions.chainBusy({ status: true }));
    this.abiCoder = new utils.AbiCoder();
    this.instantiateReadContract();
  }

  async instantiateReadContract() {
    let provider = await this.dapp.providerInitialization();
    this.readGaslessProposing = new Contract(
      GaslessPoposingMetadata.address,
      GaslessPoposingMetadata.abi,
      provider
    ) as GaslessProposing;

    this.readGaslessVoting = new Contract(
      GaslessVotingMetadata.address,
      GaslessVotingMetadata.abi,
      provider
    ) as GaslessVoting;

    this.getState();
  }

  async createProposal() {
    this.store.dispatch(Web3Actions.chainBusy({ status: true }));
    let name = this.proposalForm.controls.nameCtrl.value;
    let description = this.proposalForm.controls.descriptionCtrl.value;

    let payload = this.abiCoder.encode(
      ['string', 'string'],
      [name, description]
    );
    //await this.readGaslessProposing.createProposal(payload);

    const feeToken = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';
    const { data } =
      await this.readGaslessProposing.populateTransaction.createProposal(payload);

    // populate the relay SDK request body
    const request = {
      chainId: 5,
      target: this.readGaslessProposing.address,
      data: data!,
      isRelayContext: true,
      feeToken: feeToken,
    };

    console.log(JSON.stringify(request));

    // send relayRequest to Gelato Relay API
    const relayResponse = await GelatoRelaySDK.relayWithSyncFee(request);

    console.log(relayResponse);

    this.getState();
  }

  async vote(value: boolean) {
    try {
      this.store.dispatch(Web3Actions.chainBusy({ status: true }));
      

      await this.gaslessVoting._votingProposal(value, this.dapp.signerAddress!);
      await this.getState();
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
    this.positiveVotes = 0;
    this.negativeVotes = 0;
    this.nameProposal = '';
    this.descriptionProposal = '';
    this.lastProposalTimestamp = 0;

    this.readyToPropose =
      (await this.readGaslessProposing.getStatus()) == 0 ? true : false;

    if (this.readyToPropose == false) {
      let result =
        (await this.readGaslessVoting.getProposalState()) as ProposalStateStructOutput;

      [this.nameProposal, this.descriptionProposal] = this.abiCoder.decode(
        ['string', 'string'],
        result.payload
      );

      this.lastProposalTimestamp = +result.toString();

      this.positiveVotes = +result.positive.toString();

      this.negativeVotes = +result.negative.toString();

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

