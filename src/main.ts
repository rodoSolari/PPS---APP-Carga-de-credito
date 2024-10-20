import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { SplashScreen } from '@capacitor/splash-screen';

import { AppModule } from './app/app.module';


platformBrowserDynamic().bootstrapModule(AppModule)
  .then(() => {
    SplashScreen.hide();  // Oculta el splash screen manualmente
  })
  .catch(err => console.log(err));


  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
      const splash = document.getElementById('splash-screen');
      if (splash) {
        splash.style.opacity = '0';  // Cambia la opacidad a 0 para desvanecer
        setTimeout(() => {
          splash.style.display = 'none';  // Luego de 500ms, lo oculta completamente
        }, 500);  // Tiempo de la transición antes de ocultarlo por completo
      }
    }, 4000);  // Duración del splash screen (4 segundos)
  });
