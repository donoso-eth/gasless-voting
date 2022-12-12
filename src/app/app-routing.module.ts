import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: 'landing', pathMatch: 'full' },
  {
    path: 'landing',
    loadChildren: () =>
      import('./gasless-proposing/gasless-proposing.module').then(
        (m) => m.GaslessProposingModule
      ),
  },
  { path: 'docs', loadChildren: () => import('./docs/docs.module').then(m => m.DocsModule) }];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
