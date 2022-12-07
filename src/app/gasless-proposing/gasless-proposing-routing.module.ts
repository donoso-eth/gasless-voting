import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GaslessProposingComponent } from './gasless-proposing.component';

const routes: Routes = [{ path: '', component: GaslessProposingComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GaslessProposingRoutingModule { }
