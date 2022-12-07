import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Contract, utils } from 'ethers';
import { DappBaseComponent } from '../dapp-injector/classes';
import { DappInjector } from '../dapp-injector/dapp-injector.service';
import { GaslessProposing} from 'src/assets/contracts/interfaces/GaslessProposing';
import GaslessPoposingMetadata from 'src/assets/contracts/gasless_proposing_metadata.json';
import { Web3Actions } from 'angular-web3';
import { GaslessVoting } from 'src/assets/contracts/interfaces/GaslessVoting';
import GaslessVotingMetadata from 'src/assets/contracts/gasless_voting_metadata.json';


@Component({
  selector: 'app-gasless-proposing',
  templateUrl: './gasless-proposing.component.html',
  styleUrls: ['./gasless-proposing.component.scss'],
})
export class GaslessProposingComponent extends DappBaseComponent {
  proposalForm: FormGroup;
  readyToPropose = false;
  lastProposalTimestamp = 0;
  nameProposal!:string;
  descriptionProposal!:string;

  readGaslessProposing!: GaslessProposing;
  gaslessProposing!: GaslessProposing;

  readGaslessVoting!: GaslessVoting;
  gaslessVoting!: GaslessVoting;

  abiCoder: utils.AbiCoder;

  constructor(
    dapp: DappInjector,
    store: Store,
    public formBuilder: FormBuilder,
    public router: Router
  ) {
    super(dapp, store);
    this.proposalForm = this.formBuilder.group({
      nameCtrl: ["test", [Validators.required]],
      descriptionCtrl: ["test2",[Validators.required]],
    });
    this.store.dispatch(Web3Actions.chainBusy({ status: true }));
    this.abiCoder = new utils.AbiCoder();
    this.instantiateReadContract()
    
  }

    async instantiateReadContract(){
      let provider =  await this.dapp.providerInitialization();
      this.readGaslessProposing = new Contract(GaslessPoposingMetadata.address, GaslessPoposingMetadata.abi,provider) as GaslessProposing;

      this.readyToPropose= await this.readGaslessProposing .getStatus() == 0? true : false;

      this.readGaslessVoting = new Contract(GaslessVotingMetadata.address, GaslessVotingMetadata.abi, provider) as GaslessVoting;   



      if (this.readyToPropose== false){
        this.lastProposalTimestamp = +(await this.readGaslessProposing.getProposalTimestamp()).toString();
        
        let payload = await this.readGaslessProposing.getProposalBytes()!;

        [this.nameProposal,this.descriptionProposal] = this.abiCoder.decode(['string','string'],payload);

        await this.getState()

        this.store.dispatch(Web3Actions.chainBusy({ status: false}));
      } else {
        this.store.dispatch(Web3Actions.chainBusy({ status: false }));
      }
     
    }
  

    async createProposal(){

      this.store.dispatch(Web3Actions.chainBusy({ status: true }));
      let name = this.proposalForm.controls.nameCtrl.value;
      let description = this.proposalForm.controls.descriptionCtrl.value;

      let payload=  this.abiCoder.encode(['string','string'], [name,description]);;
      await this.gaslessProposing._createProposal(payload)

      this.store.dispatch(Web3Actions.chainBusy({ status: false }));

    }

    async getState() {
      let result = await this.gaslessVoting.getProposalState();
      console.log(result);
    }

    override async  hookContractConnected(): Promise<void> {

      let signer = this.dapp.signer!;

      this.gaslessProposing = new Contract(GaslessPoposingMetadata.address, GaslessPoposingMetadata.abi,signer) as GaslessProposing;
  
      this.gaslessVoting = new Contract(GaslessVotingMetadata.address, GaslessVotingMetadata.abi, signer) as GaslessVoting;   

        
    }



    override async hookWalletNotConnected(): Promise<void> {
        console.log('here')

  
    }


}
