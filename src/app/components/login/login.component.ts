import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  protected form = this.fb.group({
    username: [''],
    email: [''],
    password: ['', [Validators.required]]
  });

  protected loading = false as boolean;
  protected error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {}

  protected async submit() {
    if (this.form.invalid) return;
    this.loading = true;
    this.error = null;
    try {
      const payload = this.form.value;
      await this.auth.login(payload as any);
      // Redirect after successful login
      await this.router.navigate(['/']);
    } catch (err: any) {
      this.error = err?.message || String(err);
    } finally {
      this.loading = false;
    }
  }
}
