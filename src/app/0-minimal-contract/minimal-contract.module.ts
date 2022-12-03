import { NgModule,InjectionToken } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GaslessVotingComponent } from './minimal-contract/minimal-contract.component';





@NgModule({
  declarations: [
    GaslessVotingComponent
  ],
  imports: [
    CommonModule,
  ],
  exports: [
    GaslessVotingComponent,
  ],
  providers:[]
})
export class GaslessVotingModule { }
