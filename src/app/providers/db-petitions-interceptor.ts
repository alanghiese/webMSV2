import { Injectable } from '@angular/core';
import { HttpRequest, HttpResponse, HttpErrorResponse, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
// import { Events } from 'ionic-angular';

import { Observable } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

// import { EVT_SESSION_EXPIRED } from '../../constants';
import { JSONResponse } from '../interfaces';

import { Router } from '@angular/router';
import { PAGES, BOOLEAN_VAL, ERRORS, COMMON_WORDS } from '../constants';
import { localStorageModifications } from '../models/localStorageFx'

@Injectable()
export class dbPetitionsInterceptor implements HttpInterceptor {

  constructor(private router: Router) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {    
       
    return next.handle(request).pipe(
      map((event: HttpEvent<any>) => {
        let resp = event;
        if (event instanceof HttpResponse) {
          resp = event as HttpResponse<JSONResponse>;
          if (resp.body.error) {
            // si la respuesta JSON contiene el campo 'error'
            if (resp.body.error.message.includes(COMMON_WORDS.NEED_LOGIN)) {
              /* La sesión expiró o no es válida, genera evento.
               * En lugar de comparar el string del mensaje, lo mejor sería
               * setear el status de la respuesta como 403 Unauthorized */
              // this.events.publish(EVT_SESSION_EXPIRED);
              let user = localStorageModifications.getUser();
              let pass = localStorageModifications.getPassword();
              let url = localStorageModifications.getURL();
              url = this.router.url;
              //localStorageModifications.clear();
              console.log(url);
              if (url!=null)
                localStorageModifications.changeURL(url);
              localStorageModifications.changeLogged(BOOLEAN_VAL.FALSE);
              localStorageModifications.changeChecked(BOOLEAN_VAL.FALSE);
              localStorageModifications.changeRelog(BOOLEAN_VAL.FALSE);
              localStorageModifications.changeLoading(BOOLEAN_VAL.FALSE);
              localStorageModifications.changeUser(user);
              localStorageModifications.changePassword(pass);

              this.router.navigate([PAGES.LOGIN]);
              console.log(ERRORS.SESSION_EXPIRED);
              alert(ERRORS.SESSION_EXPIRED);
            } else {
              /* Workaround ya que todas las respuestas del server tienen
               * status = 200, inclusive si es un error. Si el campo error está
               * presente en la respuesta, lanzo un error para que sea manejado
               * más arriba en la app.
               */
              throw new HttpErrorResponse({ 
                error: resp.body,
                status: 400,
                statusText: resp.body.error.message
              });
            }
          }
        }
        return resp;
      })
    );
  }

}
