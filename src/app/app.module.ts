import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { environment } from 'src/environments/environment';
import { AuthModule } from './pages/auth/auth.module';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { AngularFireStorageModule } from '@angular/fire/compat/storage';
import { provideFirestore, getFirestore, FirestoreModule } from '@angular/fire/firestore';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideStorage, getStorage } from '@angular/fire/storage';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';


@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    AuthModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFireAuthModule
  ],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideStorage(() => getStorage())
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
