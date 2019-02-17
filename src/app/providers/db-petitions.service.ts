import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { API_ENDPOINTS, API_URL_BASE, PARAMETERS, ACTIONS, COMMON_WORDS, EMAIL_PARAMETERS, DESTINATION_DATA } from '../constants';
import { UserCredentials, LoginResponse, JSONResponse, Client, changeClientResponse, emailAPIResp, Email } from '../interfaces';


@Injectable({
  providedIn: 'root'
})
export class DbPetitionsService {

	constructor(public http: HttpClient){}


	//me conecta a la db, ademas me da data importante
	login(credentials: UserCredentials): Observable<LoginResponse> {
		let params = new HttpParams()
		.set(PARAMETERS.LOGIN_TYPE, "medico")                  // iniciar siempre como `medico`
		.set(PARAMETERS.USER_ID, credentials.enrollmentId)
		.set(PARAMETERS.PASSWORD, credentials.password);

		const url = `${API_URL_BASE}/${API_ENDPOINTS.login}`;
		return this.http.get<JSONResponse>(url, {params: params})
		.pipe(
			map(resp => resp.data),
			tap(resp => {
			console.log(`logged in with user id=${credentials.enrollmentId}`);
		}),
			catchError(this.handleAndThrow(`login id=${credentials.enrollmentId}`))
		);

	}


	/**
	* Conecta a la fuente de datos especificada
	* @param dataSource - nombre de la conexión de la fuente de datos
	*/
	connectToClient(dataSource: string): Observable<changeClientResponse> {
		let params = new HttpParams()
		.set(PARAMETERS.CLIENT, dataSource);

		const url = `${API_URL_BASE}/${API_ENDPOINTS.connectToClient}`;
		return this.http.get<changeClientResponse>(url, {params: params}) //JSONResponse
		.pipe(
			map(
				resp => { 
					return resp;
				}),
			tap(resp => {
			console.log(`connected to client=${resp.data.cliente}`);
		}),

			catchError(this.handleAndThrow(`connect to client=${dataSource}`))
		);
	}

	//devuelve una version estatica de datos para hacer testing
	getStatic():Observable<any>{
		return this.http.get<JSONResponse>(PARAMETERS.STATIC_URL_TO_TEST)
		.pipe(
			map(resp=> {
			return resp;
		}));
	}

	//devuelve datos del tipo turnV0
	getStatistics(from:Date, to: Date):Observable<any>{
		let params = new HttpParams()
		.set(PARAMETERS.ACTION, ACTIONS.GET_STATISTICS)
		.set(PARAMETERS.KEY, PARAMETERS.TURNSV0)
		.set(PARAMETERS.FROM, this._formatDate(from))
		.set(PARAMETERS.TO, this._formatDate(to));  
		const url = `${API_URL_BASE}/${API_ENDPOINTS.getStatistics}`;
		return this.http.get<JSONResponse>(url, {params: params})
			.pipe(
			map(resp=> {
			return resp;
		}));
	}


	//devuelve los medicos
	getDoctors(value) : Observable<any> {

		let params = new HttpParams()
		.set(PARAMETERS.ACTION, ACTIONS.GET_JSON_DOCTORS)
		.set(PARAMETERS.SERVICE, value); //value viene en blanco por defecto

		const url = `${API_URL_BASE}/${API_ENDPOINTS.getDoctors}`;
		return this.http.get<JSONResponse>(url, {params: params})
		.pipe(
			map(resp => {
			// console.log(resp);
			return resp;
		}),
			//tap(ap => console.log(`get Doctors ${params}`)),
			catchError(this.handleAndThrow(`get doctors ${params}`))
		);

	}

	//saco los turnos para un doctor, actualmente me devuelve todos los turnos para todos los doctores
	getTurnsDoctors(id:any, doctorName: string, fechaDesde: Date, fechaHasta: Date) : Observable<any> {
	    //momentoDelDia (maniana|tarde|todo)
	    //la idea seria usar todos los parametros pero actualmente no hacen nada
	    let params = new HttpParams()
	    .set(PARAMETERS.ACTION, ACTIONS.GET_JSON_TURNS)
	    .set(PARAMETERS.DOCTOR_NAME, doctorName)
	    .set(PARAMETERS.DOCTOR_ID, id)
	    .set(PARAMETERS.DATE_FROM,this._formatDate(fechaDesde))
	    .set(PARAMETERS.DATE_TO,this._formatDate(fechaHasta))
	    .set(PARAMETERS.DAY_MOMENT,COMMON_WORDS.ALL); //de momento queda en todo

	    const url = `${API_URL_BASE}/${API_ENDPOINTS.getTurnsDoctors}`;
	    return this.http.get<JSONResponse>(url, {params: params})
	      .pipe(
	        map(resp => {
	          console.log(`get turn doctors ${params}`);
	          return resp.data;
	        }),
	        //tap(ap => console.log(`get Doctors ${params}`)),
	        catchError(this.handleAndThrow(`get turn doctors ${params}`))
	      );

  	}

  	//devuelve los servicios
	getServices() : Observable<any> {

		let params = new HttpParams()
		.set(PARAMETERS.ACTION, ACTIONS.GET_JSON_SERVICES); //value viene en blanco por defecto

		const url = `${API_URL_BASE}/${API_ENDPOINTS.getDoctors}`;
		return this.http.get<JSONResponse>(url, {params: params})
		.pipe(
			map(resp => {
			// console.log(resp);
			return resp;
		}),
			//tap(ap => console.log(`get Doctors ${params}`)),
			catchError(this.handleAndThrow(`get servicios ${params}`))
		);

	}

	//es como el getStatistics pero los parametros de la fecha estan en blanco para que te de los actuales
	getActualStatistics():Observable<any>{
	    let params = new HttpParams()
	      .set(PARAMETERS.ACTION, ACTIONS.GET_STATISTICS)
	      .set(PARAMETERS.KEY,PARAMETERS.TURNSV0)
	      .set(PARAMETERS.FROM, COMMON_WORDS.EMPTY_CHAR)
	      .set(PARAMETERS.TO, COMMON_WORDS.EMPTY_CHAR);  
	    const url = `${API_URL_BASE}/${API_ENDPOINTS.getStatistics}`;
	    return this.http.get<JSONResponse>(url, {params: params})
	    .pipe(
	      map(resp=> {
	        return resp;
	      }));
	  }



	//envia el mensaje (msg) de senderName al email predeterminado
	sendEmail(senderEmail: string, msg: string, senderName: string) : Observable<Email>  {
		//seteo los valores del email predeterminado
		

		let url: string = `${API_URL_BASE}/${API_ENDPOINTS.sendEmail}`;
		let params = new HttpParams()
			.set(PARAMETERS.ACTION, ACTIONS.ENVIAR_MENSAJE_CONTACTO)
			.set(EMAIL_PARAMETERS.SENDER_EMAIL, senderEmail)
			.set(EMAIL_PARAMETERS.SENDER_NAME, senderName)
			.set(EMAIL_PARAMETERS.MSG, msg)
			.set(EMAIL_PARAMETERS.DESTINATION_EMAIL, DESTINATION_DATA.EMAIL)
			.set(EMAIL_PARAMETERS.DESTINATION_NAME, DESTINATION_DATA.NAME)

		return this.http.get<emailAPIResp>(url, {params: params})
		.pipe(
			map(resp => resp.data),
			tap(resp => {
				console.log(resp)
			}),
			catchError(this.handleAndThrow("Error al enviar el mensaje"))
		)
	}


	//envia el mensaje (msg) de senderName al email del parametro
	sendEmailTo(senderEmail: string, msg: string, senderName: string, 
			  destinationEmail: string, destinationName: string) : Observable<Email>  {
		//seteo los valores del email predeterminado
		

		let url: string = `${API_URL_BASE}/${API_ENDPOINTS.sendEmail}`;
		let params = new HttpParams()
			.set(PARAMETERS.ACTION, ACTIONS.ENVIAR_MENSAJE_CONTACTO)
			.set(EMAIL_PARAMETERS.SENDER_EMAIL, senderEmail)
			.set(EMAIL_PARAMETERS.SENDER_NAME, senderName)
			.set(EMAIL_PARAMETERS.MSG, msg)
			.set(EMAIL_PARAMETERS.DESTINATION_EMAIL, destinationEmail)
			.set(EMAIL_PARAMETERS.DESTINATION_NAME, destinationName)

		return this.http.get<emailAPIResp>(url, {params: params})
		.pipe(
			map(resp => resp.data),
			tap(resp => {
				console.log(resp)
			}),
			catchError(this.handleAndThrow("Error al enviar el mensaje"))
		)
	}




//uitilidades

	/**
	* Devuelve un string con la descripción del error.
	* @param err - error
	* @param operation - nombre de la operación que falló
	*/
	private prettifyError(err: any, operation='operation'): string {
		let errDetail: string;

		if (err instanceof HttpErrorResponse)
			errDetail = `with code ${err.error.error.code}: ${err.error.error.message}`;
		else
			errDetail = `${err.message}`;

		return `${operation} failed ${errDetail}`;
	}

	/**
	* Procesa la operación HTTP que falló y lanza un error.
	* No deja que el flujo de la aplicación continúe.
	* @param operation - nombre de la operación que falló
	*/
	private handleAndThrow(operation?: string) {
		return (err: any): never => {
			let errMsg = this.prettifyError(err, operation);
			// TODO: send the error to remote logging infrastructure
			console.error(err);
			console.log(errMsg);
			throw err;
		};
	}



	/**
	* Devuelve un string con la fecha formateada como `YYYY-MM-DD`.
	* @param date - fecha a formatear
	*/
	_formatDate(date: Date): string {
		// añade un 0 adelante cuando el numero es menor a 10
		function pad(n: number) { return n < 10 ? '0' + n : n };

		return date.getUTCFullYear() + '-'
									+ pad(date.getUTCMonth() + 1) + '-'
									+ pad(date.getUTCDate());
	}







	/**
	* Handle Http operation that failed and let the app continue.
	* @param operation - name of the operation that failed
	* @param result - optional value to return as the observable result
	*/
	private handleAndContinue<T>(operation?: string, result?: T) {
		return (err: any): Observable<T> => {
			let errMsg = this.prettifyError(err, operation);
			// TODO: send the error to remote logging infrastructure
			console.error(err);
			console.log(errMsg);
			// Let the app keep running by returning an empty result.
			return of(result as T);
		};
	}



}
