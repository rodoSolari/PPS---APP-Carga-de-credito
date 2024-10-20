import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {

  loginForm: FormGroup;

  constructor(
    private authService: AuthService,
    private router: Router,
    private fb: FormBuilder
  ) {
    // Crear el formulario de login con validaciones
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  // Método de inicio de sesión
  login() {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      this.authService.login(email, password).then(
        (res) => {
          console.log('Login exitoso');
          this.router.navigate(['/scan']); // Redirige a la página principal
        },
        (err) => {
          Swal.fire({
            icon: 'error',
            title: '<span style="font-family: \'Racing Sans One\', sans-serif;">Error</span>',
            html: '<p style="font-family: \'Racing Sans One\', sans-serif;">Por favor, ingresa un correo y contraseña válidos.</p>',
            background: '#9370DB',
            color: 'white',
            heightAuto: false,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Aceptar'
          });
        }
      );
    } else {
      console.log('El formulario es inválido');
    }
  }

  quickLogin(email: string, password: string) {
    this.loginForm.patchValue({
      email: email,
      password: password
    });

  }

}
