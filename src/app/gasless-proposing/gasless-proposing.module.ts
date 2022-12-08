import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GaslessProposingRoutingModule } from './gasless-proposing-routing.module';
import { GaslessProposingComponent } from './gasless-proposing.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import {InputTextareaModule} from 'primeng/inputtextarea';
import { ToastModule } from 'primeng/toast';

@NgModule({
  declarations: [
    GaslessProposingComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    InputTextareaModule,
    GaslessProposingRoutingModule,
    ToastModule
  ]
})
export class GaslessProposingModule { }
