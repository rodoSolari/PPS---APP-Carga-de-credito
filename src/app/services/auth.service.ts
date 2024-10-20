import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { Firestore, doc, getDoc, collection, query, where, getDocs } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private afAuth: AngularFireAuth, private firestore: Firestore) {}

  // Método para iniciar sesión
  login(email: string, password: string) {
    return this.afAuth.signInWithEmailAndPassword(email, password);
  }

  // Método para registrar un nuevo usuario
  register(email: string, password: string) {
    return this.afAuth.createUserWithEmailAndPassword(email, password);
  }

  // Método para cerrar sesión
  logout() {
    return this.afAuth.signOut();
  }

  // Obtener el estado del usuario actual
  getUser() {
    return this.afAuth.authState;
  }

  async getUserProfile(email: string): Promise<string> {
    const userCollection = collection(this.firestore, 'Usuarios'); // Accedemos a la colección 'Usuarios'
    const q = query(userCollection, where('correo', '==', email)); // Consultamos por el campo 'correo'
    const querySnapshot = await getDocs(q); // Realizamos la consulta

    if (!querySnapshot.empty) { // Verificamos si la consulta arrojó resultados
      const userDoc = querySnapshot.docs[0]; // Obtenemos el primer documento que coincide
      const userProfile = userDoc.data()['perfil'];; // Obtenemos el campo 'perfil'
      return userProfile; // Devolvemos 'admin', 'usuario', 'invitado'
    } else {
      throw new Error('Usuario no encontrado');
    }
  }
}
