import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Contract } from 'ethers';
import { DappBaseComponent } from '../dapp-injector/classes';
import { DappInjector } from '../dapp-injector/dapp-injector.service';
import { GaslessProposing} from 'src/assets/contracts/interfaces/GaslessProposing';
import GaslessPoposingMetadata from 'src/assets/contracts/gasless_proposing_metadata.json';


@Component({
  selector: 'app-gasless-proposing',
  templateUrl: './gasless-proposing.component.html',
  styleUrls: ['./gasless-proposing.component.scss'],
})
export class GaslessProposingComponent extends DappBaseComponent {
  proposalForm: FormGroup;
  readyToPropose = false;
  lastProposalTimestamp = 0;
  constructor(
    dapp: DappInjector,
    store: Store,
    public formBuilder: FormBuilder,
    public router: Router
  ) {
    super(dapp, store);
    this.proposalForm = this.formBuilder.group({
      nameCtrl: ["", [Validators.required]],
      descriptionCtrl: ["",[Validators.required]],
    });
    this.instantiateReadContract()
    
  }

    async   instantiateReadContract(){
      let provider =  await this.dapp.providerInitialization();
      let gaslessRead = new Contract(GaslessPoposingMetadata.address, GaslessPoposingMetadata.abi,provider) as GaslessProposing

      this.readyToPropose= await gaslessRead.getStatus() == 0? true : false;


      if (this.readyToPropose== false){
        this.lastProposalTimestamp = +(await gaslessRead.getProposalTimestamp()).toString()
      }


    }
  


    override async hookWalletNotConnected(): Promise<void> {
        console.log('here')

   


    }


}
