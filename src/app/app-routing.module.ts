import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: 'landing', pathMatch: 'full' },
  {
    path: 'home',
    loadChildren: () =>
      import('./gasless-voting/gasless-voting.module').then(
        (m) => m.GaslessVotingModule
      ),
  },
  {
    path: 'landing',
    loadChildren: () =>
      import('./gasless-proposing/gasless-proposing.module').then(
        (m) => m.GaslessProposingModule
      ),
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
