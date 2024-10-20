import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { AngularFirestore, DocumentData } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Plugins } from '@capacitor/core';
import { AlertController } from '@ionic/angular';  // Importa AlertController


const { DeviceMotion, Vibration } = Plugins;

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})

export class HomePage {

  alarmActive: boolean = false;  // Estado de la alarma
  userPassword!: string;  // Contraseña del usuario logueado
  user: any;

  constructor(private afAuth: AngularFireAuth,
              private authService : AuthService,
              private firestore: AngularFirestore,
              private router : Router,
              private alertController: AlertController) {

   /* this.afAuth.authState.subscribe(user => {
      if (user) {
        this.getUserPassword(user.uid);  // Obtén la contraseña usando el UID del usuario
      }
    });*/
  }

  // Método para cerrar sesión
  logout() {
    this.authService.logout().then(() => {
      this.router.navigate(['./auth/login']);
    }).catch(err => {
      console.error('Error al cerrar sesión:', err);
    });
  }


  goToScores() {
    this.router.navigate(['/puntajes']);  // Redirigir a la página de puntajes
  }

  setDifficulty(difficulty: string) {
    switch (difficulty) {
      case 'facil':
        this.router.navigate(['/facil']);  // Redirige al componente Fácil
        break;
      case 'medio':
        this.router.navigate(['/medio']);  // Redirige al componente Medio
        break;
      case 'dificil':
        this.router.navigate(['/dificil']);  // Redirige al componente Difícil
        break;
      default:
        console.log('Dificultad no reconocida');
    }
  }
/*
  getUserPassword(uid: string) {
    this.firestore.collection('users').doc(uid).get().subscribe(userDoc => {
      if (userDoc.exists) {
        const userData = userDoc.data() as DocumentData;  // Tipar el documento de manera segura
        if (userData && userData['password']) {
          this.userPassword = userData['password'] as string;  // Asignar la contraseña
        } else {
          console.error('No se encontró el campo de contraseña para este usuario.');
        }
      } else {
        console.error('El documento del usuario no existe.');
      }
    }, error => {
      console.error('Error al obtener la contraseña: ', error);
    });
  }

*/

}
