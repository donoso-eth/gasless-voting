import { NgModule,InjectionToken } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GaslessVotingComponent } from './gasless-voting/gasless-voting.component';
import { GaslessVotingRoutingModule } from './gasless-voting-routing.module';





@NgModule({
  declarations: [
    GaslessVotingComponent
  ],
  imports: [
    CommonModule,
   GaslessVotingRoutingModule
  ],
  exports: [
    GaslessVotingComponent,
  ],
  providers:[]
})
export class GaslessVotingModule { }
