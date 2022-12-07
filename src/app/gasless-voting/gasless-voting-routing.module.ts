import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GaslessVotingComponent } from './gasless-voting/gasless-voting.component';

const routes: Routes = [{ path: '', component: GaslessVotingComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GaslessVotingRoutingModule { }
