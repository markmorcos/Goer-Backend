import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { AuthService } from './auth.service';
import { ResourceService } from './resource.service';
import { ConstantService } from './constant.service';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { SignInComponent } from './sign-in/sign-in.component';
import { HeaderComponent } from './header/header.component';
import { DashboardComponent } from './dashboard/dashboard.component';

import { ResourcesComponent } from './resources/resources.component';
import { ListResourcesComponent } from './resources/list-resources/list-resources.component';
import { ReadResourceComponent } from './resources/read-resource/read-resource.component';
import { ResourceFormComponent } from './resources/resource-form/resource-form.component';

@NgModule({
  declarations: [
    AppComponent,
    SignInComponent,
    HeaderComponent,
    DashboardComponent,
    ResourcesComponent,
    ListResourcesComponent,
    ReadResourceComponent,
    ResourceFormComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule
  ],
  providers: [
    AuthService,
    ResourceService,
    ConstantService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
