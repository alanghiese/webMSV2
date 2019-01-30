//angular modules
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ChartsModule } from 'ng2-charts';
import { FormsModule } from '@angular/forms';

//para los calendarios
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { CalendarHeaderComponent } from './demo-utils/calendar-header.component';
import 'flatpickr/dist/flatpickr.css';
import { FlatpickrModule } from 'angularx-flatpickr';

import localeAr from '@angular/common/locales/es-AR';
import { registerLocaleData } from '@angular/common';
registerLocaleData(localeAr);


//servicios
import { AppRoutingModule } from './app-routing.module';
import { ExcelService } from './providers/excel.service';
import { EncoderDecoderService } from './providers/encoder-decoder.service';
import { DbPetitionsService } from './providers/db-petitions.service';
import { dbPetitionsInterceptor } from './providers/db-petitions-interceptor';
import { SessionProvider } from './providers/session.provider';



import { CommonModule } from '@angular/common';
import { NgbModalModule } from '@ng-bootstrap/ng-bootstrap';



//pipes
import { UPPERCASE } from './pipes/toUpperCase.pipe';

//componentes
import { AppComponent } from './app.component';
import { ButtonsComponent } from './components/buttons/buttons.component';
import { CloseButtonComponent } from './components/close-button/close-button.component';
import { FiltersComponent } from './components/filters/filters.component';
import { NavBarComponent } from './components/nav-bar/nav-bar.component';
import { UparrowComponent } from './components/uparrow/uparrow.component';
import { ContactComponent } from './pages/contact/contact.component';
import { EmptyComponent } from './pages/empty/empty.component';
import { Error404Component } from './pages/error404/error404.component';
import { LoadingComponent } from './pages/loading/loading.component';
import { MedicalHistoryComponent } from './pages/medical-history/medical-history.component';
import { GraphsComponent } from './pages/graphs/graphs.component';
import { MyTurnsComponent } from './pages/my-turns/my-turns.component';
import { TurnsComponent } from './pages/turns/turns.component';
import { RealTimeComponent } from './pages/real-time/real-time.component';
import { LoginComponent } from './pages/login/login.component';
import { routing, appRoutingProviders } from './app-routing.module';
import { FooterComponent } from './components/footer/footer.component';
import { CalendarComponent } from './components/calendar/calendar.component'

@NgModule({
  declarations: [
    AppComponent,
    ButtonsComponent,
    CloseButtonComponent,
    FiltersComponent,
    NavBarComponent,
    UparrowComponent,
    ContactComponent,
    EmptyComponent,
    Error404Component,
    LoadingComponent,
    MedicalHistoryComponent,
    GraphsComponent,
    UPPERCASE,
    MyTurnsComponent,
    TurnsComponent,
    RealTimeComponent,
    LoginComponent,
    FooterComponent,
    //para calendario
    CalendarHeaderComponent,
    CalendarComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    NgbModule.forRoot(),
    ChartsModule,
    HttpClientModule,
    routing,
    AppRoutingModule,
    //para los calendarios
    BrowserAnimationsModule,
    CalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory
    }),
    FlatpickrModule.forRoot()
    //fin de para los calendarios
  ],
  providers: [
	AppRoutingModule,
    ExcelService,
	EncoderDecoderService,
    SessionProvider,
    DbPetitionsService,
    { provide: HTTP_INTERCEPTORS, useClass: dbPetitionsInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

