import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { AuthRoutingModule } from './auth-routing.module'; // Importamos el archivo de rutas
import { LoginPage } from './login/login.page';
import { RegisterPage } from './register/register.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    AuthRoutingModule // Importa el archivo de rutas
  ],
  declarations: [LoginPage, RegisterPage] // Declara las páginas de login y register
})
export class AuthModule {}
