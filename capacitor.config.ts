import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.cargacreditos',
  appName: 'cargacreditos',
  webDir: 'www',
  plugins: {
    SplashScreen: {
      launchAutoHide: false,  // Desactivamos el auto-hide para que no interfiera
      backgroundColor: '#4d81c6',  // Color de fondo del splash screen
      showSpinner: false      // Desactivamos el spinner por si no lo necesitas
    },
    BarcodeScanner: {
      permissions: {
        camera: {
          description: 'Se necesita acceso a la cámara para escanear códigos QR'
        }
      }
    }
  }
};

export default config;
