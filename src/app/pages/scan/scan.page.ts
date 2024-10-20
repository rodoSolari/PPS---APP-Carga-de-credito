import { Component, OnInit } from '@angular/core';
import { addDoc, collection, doc, Firestore, getDoc, getDocs, query, setDoc, updateDoc, where, writeBatch } from '@angular/fire/firestore';
import { Barcode, BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';
import { ToastController } from '@ionic/angular';
import { firstValueFrom } from 'rxjs';
import { Timestamp } from '@firebase/firestore';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-scan',
  templateUrl: './scan.page.html',
  styleUrls: ['./scan.page.scss'],
})
export class ScanPage {

  credits = 0; // Visor de créditos
  scannedCode: string = '';
  userRole: string = ''; // El perfil del usuario (admin/usuario/invitado)
  userId: string = ''; // El ID del usuario logueado
  totalCredits: number = 0; // Créditos acumulados
  loadingCredits: boolean = false;

  // Para llevar un registro de cuántas veces se ha escaneado cada código
  //private scannedBarcodes: { [key: string]: number } = {};

  constructor(
    private firestore: Firestore,
    private authService: AuthService,
    private toastController: ToastController,
    private router : Router
  ) {}

  ionViewWillEnter() {
    this.loadUserCredits();
  }

  async loadUserCredits() {
    this.totalCredits = 0;
    this.loadingCredits = false;

    const user = await firstValueFrom(this.authService.getUser()); // Obtener el valor del usuario logueado
    if (user && user.email) {

      // Asumiendo que el usuario ya está registrado en la colección 'codigo_usuarios'
      const userDocRef = doc(this.firestore, 'codigo_usuarios', user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        this.userId = user.uid; // Guardar el ID del usuario
        this.userRole = userDocSnap.data()['perfil']; // Obtener el perfil del usuario
        this.totalCredits = userDocSnap.data()['credits'] || 0; // Cargar los créditos acumulados
      } else {
        console.log('No se encontró el usuario en la base de datos.');
      }
    } else {
      console.log('Usuario no autenticado o sin correo electrónico');
    }
     this.loadingCredits = true;
  }

  // Función para escanear el código QR
  async scan(): Promise<void> {
    try {
      const granted = await this.requestPermissions();

      if (!granted) {
        this.presentToast('Permiso de cámara denegado.', 'danger');
        return;
      }

      const result = await BarcodeScanner.scan(); // Inicia el escaneo del código QR

      if (result.barcodes && result.barcodes.length > 0) {
        for (const barcode of result.barcodes) {
          //this.presentToast(`Código escaneado: ${barcode.rawValue}`, 'success');

          const qrCodeCollection = collection(this.firestore, 'qr_codes');
          const q = query(qrCodeCollection, where('code', '==', barcode.rawValue)); // Consultar si el código existe en Firestore
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            //this.presentToast('Código encontrado en Firestore', 'success');
            const qrCodeDoc = querySnapshot.docs[0]; // Obtener el primer resultado (debería ser único)
            const creditValue = qrCodeDoc.data()['credit']; // Obtener el valor del crédito del QR

            // Verificar si el usuario ya ha usado el código
            this.checkIfCodeUsedByUser(barcode.rawValue, creditValue);
          } else {
            this.presentToast('El código QR no existe en la base de datos.', 'danger');
          }
        }
      } else {
        this.presentToast('No se encontró ningún contenido en el código QR.', 'warning');
      }

    } catch (error: any) {
  //    this.presentToast('Error al escanear el código QR.', 'danger');
    }
  }

  // Verificar permisos de la cámara
  async requestPermissions(): Promise<boolean> {
    try {
      const { camera } = await BarcodeScanner.requestPermissions();
      return camera === 'granted' || camera === 'limited';
    } catch (error: any) {
      //console.error('Error al solicitar permisos de cámara', error);
      return false;
    }
  }

  async addUserToFirestore(userId: string, email: string, perfil: string) {
    try {
      const userDocRef = doc(this.firestore, `codigo_usuarios/${userId}`);

      // Crea el documento del usuario en Firestore
      await setDoc(userDocRef, {
        email: email,
        perfil: perfil
      });

    //  this.presentToast(`Usuario ${email} añadido a Firestore.`, 'success');
    } catch (error) {
      console.error('Error al añadir usuario en Firestore:', error);
   //   this.presentToast('Error al añadir usuario en Firestore.', 'danger');
    }
  }

  async checkIfCodeUsedByUser(code: string, creditValue: number) {
    const usedCodeRef = doc(this.firestore, `codigo_usuarios/${this.userId}/used_codes/${code}`);
    const usedCodeSnap = await getDoc(usedCodeRef);

    if (usedCodeSnap.exists()) {
      if (this.userRole === 'admin') {
        const uses = usedCodeSnap.data()['uses'] || 0;

        if (uses < 2) {
          this.addCredit(creditValue);
          // Actualizar la subcolección para registrar el uso
          updateDoc(usedCodeRef, { uses: uses + 1 });
          Swal.fire({
            icon: 'success',
            title: 'Créditos añadidos',
            text: `Créditos añadidos: ${creditValue}. Total: ${this.totalCredits}`,
            timer: 3000,
            background: '#e0f7fa',  // Fondo azul claro
            confirmButtonColor: '#0288d1',  // Botón azul oscuro
            confirmButtonText: '¡Entendido!',
            heightAuto: false,
            color: '#006064',  // Texto azul oscuro para contraste
            timerProgressBar: true,
            customClass: {
              title: 'swal-title-bold',
              htmlContainer: 'swal-text-bold',
              confirmButton: 'swal-button-bold',
            },
          });
          //this.presentToast(`Créditos añadidos: ${creditValue}. Total: ${this.totalCredits}`, 'success');
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Límite alcanzado',
            text: 'Ya has usado este código más de dos veces.',
            background: '#fce4ec',  // Fondo rojo claro
            confirmButtonColor: '#d32f2f',  // Botón rojo oscuro
            confirmButtonText: 'De acuerdo',
            heightAuto: false,
            color: '#d32f2f',  // Texto rojo oscuro
            customClass: {
              title: 'swal-title-bold',
              htmlContainer: 'swal-text-bold',
              confirmButton: 'swal-button-bold',
            },
          });
          //this.presentToast('Ya has usado este código más de dos veces.', 'danger');
        }
      } else {
        Swal.fire({
          icon: 'warning',
          title: 'Código usado',
          text: 'Ya has utilizado este código.',
          background: '#fff3cd',  // Fondo amarillo claro
          confirmButtonColor: '#ffcc00',  // Botón amarillo
          confirmButtonText: 'Ok',
          heightAuto: false,
          color: '#856404',  // Texto más oscuro para contraste
          customClass: {
            title: 'swal-title-bold',
            htmlContainer: 'swal-text-bold',
            confirmButton: 'swal-button-bold',
          },
        });
       // this.presentToast('Ya has utilizado este código.', 'warning');
      }
    } else {
      // Si no existe en la subcolección, es la primera vez que lo utiliza
      this.addCredit(creditValue);

      setDoc(usedCodeRef, { usedAt: Timestamp.now(), uses: 1 });
      Swal.fire({
        icon: 'success',
        title: 'Créditos añadidos',
        text: `Créditos añadidos: ${creditValue}. Total: ${this.totalCredits}`,
        timer: 3000,
        background: '#e0f7fa',  // Fondo azul claro
        confirmButtonColor: '#0288d1',  // Botón azul oscuro
        confirmButtonText: '¡Entendido!',
        heightAuto: false,
        color: '#006064',  // Texto azul oscuro para contraste
        timerProgressBar: true,
        customClass: {
          title: 'swal-title-bold',
          htmlContainer: 'swal-text-bold',
          confirmButton: 'swal-button-bold',
        },
      });
     // this.presentToast(`Créditos añadidos: ${creditValue}. Total: ${this.totalCredits}`, 'success');
    }
  }

  addCredit(creditValue: number) {
    this.totalCredits += creditValue;

    // Actualizar el campo 'credits' en Firestore
    const userDocRef = doc(this.firestore, 'codigo_usuarios', this.userId);
    updateDoc(userDocRef, { credits: this.totalCredits });

   // this.presentToast(`Créditos añadidos: ${creditValue}. Total: ${this.totalCredits}`, 'success');
  }


  // Presentar un mensaje con ToastController
  async presentToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color,
    });
    toast.present();
  }


  // Función para limpiar créditos
  async resetCredits() {
  this.totalCredits = 0;

  // Actualizar el campo 'credits' en Firestore
  const userDocRef = doc(this.firestore, 'codigo_usuarios', this.userId);
  await updateDoc(userDocRef, { credits: this.totalCredits });

  // Eliminar todos los códigos de la subcolección used_codes
  const usedCodesCollectionRef = collection(this.firestore, `codigo_usuarios/${this.userId}/used_codes`);
  const usedCodesSnapshot = await getDocs(usedCodesCollectionRef);

  const batch = writeBatch(this.firestore);
  usedCodesSnapshot.forEach((doc) => {
    batch.delete(doc.ref);
  });

  await batch.commit(); // Confirmar la eliminación en Firestore

  Swal.fire({
    icon: 'success',
    title: '¡Todo reiniciado!',
    html: '<b>Créditos:</b> ahora tienes 0<br><b>Códigos:</b> Todos han sido eliminados.',
    background: '#8A2BE2',  // Fondo violeta oscuro
    confirmButtonText: 'Aceptar',
    confirmButtonColor: '#9370DB',  // Botón púrpura claro
    color: '#ffffff',  // Texto blanco
    heightAuto: false,
    backdrop: `rgba(0, 0, 0, 0.5)`,
    customClass: {
      title: 'swal-title-bold',
      htmlContainer: 'swal-text-bold',
      confirmButton: 'swal-button-bold',
    },
  });

  }

  async confirmResetCredits() {

  // Eliminar todos los códigos de la subcolección used_codes
  const usedCodesCollectionRef = collection(this.firestore, `codigo_usuarios/${this.userId}/used_codes`);
  const usedCodesSnapshot = await getDocs(usedCodesCollectionRef);

  if (usedCodesSnapshot.empty) {
    // this.presentToast('No hay códigos para eliminar.', 'warning');
    Swal.fire({
      icon: 'success',
      title: '¡No hay codigos!',
      html: 'No hay códigos para eliminar.',
      background: '#8a2be2',  // Fondo azul violeta
      confirmButtonText: 'Aceptar',
      heightAuto:false,
      confirmButtonColor: '#9370db',  // Color del botón
      color: '#fff',  // Color del texto
      backdrop: `
        rgba(0, 0, 0, 0.5)
        left top
        no-repeat
      `
    });
  }else{
      const result = await Swal.fire({
      icon: 'warning',
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará todos tus créditos acumulados y los códigos usados.',
      showCancelButton: true,
      confirmButtonColor: '#d33', // Botón de confirmación en rojo
      cancelButtonColor: '#3085d6', // Botón de cancelación en azul
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      background: '#FFE4B5', // Fondo amarillo claro
      color: '#000', // Texto negro
      heightAuto: false,
      customClass: {
        title: 'swal-title-bold',
        htmlContainer: 'swal-text-bold',
        confirmButton: 'swal-button-bold',
      },
    });

    if (result.isConfirmed) {
      // Si el usuario confirma, ejecuta la función de resetear los créditos.
      await this.resetCredits();
    }
  }

  }

  logout() {
  //  this.totalCredits = 0;
  //  this.loadingCredits = true;
    this.authService.logout().then(() => {
      this.router.navigate(['./auth/login']);
    }).catch(err => {
      console.error('Error al cerrar sesión:', err);
    });
  }




}
