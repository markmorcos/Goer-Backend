import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../auth.service';
import { ConstantService } from '../constant.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  error = '';

  constructor(private router: Router,
              private authService: AuthService,
              private constantService: ConstantService) {
    if (!this.authService.isSignedIn()) {
      this.router.navigate(['/sign-in']);
    }
  }

  ngOnInit() {
    this.constantService.error.subscribe(error => this.error = error);
  }

  onSignOut() {
    this.authService.signOut().subscribe(success => this.router.navigate(['/sign-in']));
  }
}
