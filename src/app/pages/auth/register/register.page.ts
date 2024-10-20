import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage {
  registerForm: FormGroup;

  constructor(
    private authService: AuthService,
    private router: Router,
    private fb: FormBuilder
  ) {
    // Crear el formulario de registro con validaciones
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  // Método de registro
  register() {
    if (this.registerForm.valid) {
      const { email, password } = this.registerForm.value;
      this.authService.register(email, password).then(
        (res) => {
          console.log('Usuario registrado exitosamente');
          this.router.navigate(['/home']); // Redirige a la página principal
        },
        (err) => {
          console.log('Error en el registro:', err);
        }
      );
    } else {
      console.log('El formulario es inválido');
    }
  }
}
