import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  signedIn = false;

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit() {
    if (!this.authService.isSignedIn()) {
      this.router.navigate(['/sign-in']);
    }
  }
}
