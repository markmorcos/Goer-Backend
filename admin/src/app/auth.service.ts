import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import { Observable } from 'rxjs/Observable';

@Injectable()
export class AuthService {
  constructor(private httpClient: HttpClient) { }

  signIn(email, password) {
    return this.httpClient
    .post('/api/sign-in', { email, password })
    .map((response: any) => localStorage.setItem('token', response.data.token));
  }

  signOut() {
    return this.httpClient.delete('/api/sign-out', { params: { token: this.getToken() } })
    .map(() => localStorage.clear());
  }

  isSignedIn() {
    return this.getToken() !== null;
  }

  getToken() {
    return localStorage.getItem('token');
  }
}
