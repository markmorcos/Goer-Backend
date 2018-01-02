import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.css']
})
export class SignInComponent implements OnInit {
  email = '';
  password = '';
  error: '';
  loading = false;

  constructor(private authService: AuthService, private router: Router) {
    if (this.authService.isSignedIn()) {
      this.router.navigate(['/']);
    }
  }

  ngOnInit() { }

  onSignIn(form) {
    const { email, password } = form.value;
    this.loading = true;
    this.authService.signIn(email, password).subscribe(
      response => {
        this.error = '';
        this.loading = false;
        this.router.navigate(['/']);
      },
      response => {
        this.error = response.error.message;
        this.loading = false;
      }
    );
  }
}
