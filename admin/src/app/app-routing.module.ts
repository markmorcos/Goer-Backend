import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AppComponent } from './app.component';
import { SignInComponent } from './sign-in/sign-in.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ResourcesComponent } from './resources/resources.component';
import { ListResourcesComponent } from './resources/list-resources/list-resources.component';
import { ResourceFormComponent } from './resources/resource-form/resource-form.component';
import { ReadResourceComponent } from './resources/read-resource/read-resource.component';

const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'sign-in', component: SignInComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: ':model', component: ResourcesComponent, children: [
    { path: '', component: ListResourcesComponent, pathMatch: 'full' },
    { path: 'new', component: ResourceFormComponent },
    { path: ':id', component: ReadResourceComponent },
    { path: ':id/edit', component: ResourceFormComponent }
  ] }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
