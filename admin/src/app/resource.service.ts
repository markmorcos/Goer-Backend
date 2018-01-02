import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import { Observable } from 'rxjs/Observable';
import { AuthService } from './auth.service';

@Injectable()
export class ResourceService {
  constructor(private httpClient: HttpClient, private authService: AuthService) { }

  getResources(model: string) {
    return this.httpClient
    .get(`/api/${model}`, { params: { token: this.authService.getToken() } })
    .map((response: any) => response.data);
  }

  getResource(model: string, id: string) {
    return this.httpClient
    .get(`/api/${model}/${id}`, { params: { token: this.authService.getToken() } })
    .map((response: any) => response.data);
  }

  saveResource(model: string, id: string, resource: any) {
    return id
    ? this.httpClient
    .put(`/api/${model}/${id}`, resource, { params: { token: this.authService.getToken() } })
    .map((response: any) => response.data)
    : this.httpClient
    .post(`/api/${model}`, resource, { params: { token: this.authService.getToken() } })
    .map((response: any) => response.data);
  }

  deleteResource(model: string, id: string) {
    return this.httpClient
    .delete(`/api/${model}/${id}`, { params: { token: this.authService.getToken() } })
    .map((response: any) => response.success);
  }
}
