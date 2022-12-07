import { NgModule,InjectionToken } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GaslessVotingComponent } from './gasless-voting/gasless-voting.component';
import { GaslessVotingRoutingModule } from './gasless-voting-routing.module';
import { ButtonModule } from 'primeng/button';

import {InputTextModule} from 'primeng/inputtext';




@NgModule({
  declarations: [
    GaslessVotingComponent
  ],
  imports: [
    CommonModule,
   GaslessVotingRoutingModule,
   ButtonModule,
   InputTextModule
  ],
  exports: [
    GaslessVotingComponent,
  ],
  providers:[]
})
export class GaslessVotingModule { }
