import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GaslessProposingRoutingModule } from './gasless-proposing-routing.module';
import { GaslessProposingComponent } from './gasless-proposing.component';


@NgModule({
  declarations: [
    GaslessProposingComponent
  ],
  imports: [
    CommonModule,
    GaslessProposingRoutingModule
  ]
})
export class GaslessProposingModule { }
