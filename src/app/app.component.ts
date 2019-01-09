import { Component } from '@angular/core';
import { Filter } from './models/filter'
import { Router } from '@angular/router';
import { localStorageModifications } from './models/localStorageFx';
import { BOOLEAN_VAL, PAGES, STATE_TURN_LETTER, COMMON_WORDS, ERRORS } from './constants';
import { serviceObject, coverageObject, UserCredentials } from './interfaces';
import { DbPetitionsService } from './providers/db-petitions.service';
import { EncoderDecoderService } from './providers/encoder-decoder.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html?v=${new Date().getTime()',
  styleUrls: ['./app.component.css?v=${new Date().getTime()'],
  providers: [ DbPetitionsService, EncoderDecoderService ]
})

//CON ?v=${new Date().getTime() EN EL @Component fuerzo al navegador a eliminar el cache
export class AppComponent {

	/*las variables no tienen ninguna visibilidad especificado para que sean publicas por defecto.
	se podrian implemntar setters a getters*/

	//variable para saber si mostrar o no ciertos campos en la seccion de tiempo real
	now: boolean;
	//filtros globales a la aplicacion
	filter: Filter;
	//mostrar o no los estado de turnos en los filtros
	stateFilter: boolean = false;
	//arreglo con los clientes disponibles
	clients: any[];
	/*este intervalo lo uso en el componente de tiempo real y lo voy limpiando en cada pagina.
	MUY IMPORTANTE: cada nueva pagina tiene que usar la linea clearInterval(this.appComponent.interval); para evitar
	que el intervalo siga funcionando*/
	interval;

	//arreglos para los filtros
	doctors: any[] = [];	
	services: any[] = [];
	coverages: any[] = [];
	//esta boolean sirve para no reloguear cada vez que cambia de componente para recargar los arreglos
	needLoadArrays: boolean = true;

	constructor(
				private router: Router,
				private _DbPetitionsService: DbPetitionsService,
				private _EncoderDecoderService: EncoderDecoderService) {
		
		
	    /*console.log(localStorageModifications.getURL())
	    if (localStorageModifications.getURL()!=null)
	    		this.router.navigate([localStorageModifications.getURL()]);
	    	else
        		this.router.navigate([PAGES.LOGIN]);
		*/
		localStorageModifications.changeLoading(BOOLEAN_VAL.FALSE);
	    
	    this.filter = new Filter(
	    							COMMON_WORDS.EMPTY_CHAR,
	    							COMMON_WORDS.EMPTY_CHAR,
	    							COMMON_WORDS.EMPTY_CHAR,
	    							COMMON_WORDS.EMPTY_CHAR,
	    							COMMON_WORDS.EMPTY_CHAR,
	    							STATE_TURN_LETTER.ALL,
	    							COMMON_WORDS.EMPTY_CHAR,
	    							COMMON_WORDS.EMPTY_CHAR
	    						);


	}

	ngOnInit(){
		if(window.innerHeight > window.innerWidth)
    		alert(ERRORS.BEST_EXPERIENCIE);



	}

	//retorna los clientes
	getClients():any[]{
		if (this.clients)
			return this.clients;
		return [''];
	}
	//retorna el cliente actual
	getCurrentClient(){
		if (this.clients)
			return this.clients[0];
		return COMMON_WORDS.NULL;
	}

	setCoverages(c:coverageObject[]){
		this.coverages = [];
		// console.log(c)
		for (var i = 0; i < c.length; i++) {
			if (c[i] != null)
				this.coverages.push(c[i].nombre);
		}
	}

	getCoverages():any[]{
		if (this.coverages)
			return this.coverages;
		return [''];
	}

	setClients(c:any[]){
		this.clients = c;
	}

	setDoctors(d:any[]){
		this.doctors = [];
		this.doctors = d;
	}

	getDoctors():any[]{
		if (this.doctors)
			return this.doctors;
		return [''];
	}

	setServices(s:any[]){
		this.services = [];
		for (var i = 0; i < s.length; i++) {
			if (s[i] != null)
				this.services.push(s[i].SERVICIO);
		}
	}

	getServices():any[]{
		if (this.services)
			return this.services;
		return [''];
	}

	isLogged():boolean{
		return localStorageModifications.getLogged();
	}

	

	isLoading(){
		return localStorageModifications.getLoading();
	}

	/*
	* esta funcion se usa para cuando el usuario ya tiene la sesion iniciada y no necesita 
	* reloguearse, en este caso se llama a los metodos de login sin necesidad de redireccionar
	* para asi poder obtener los datos para cargar todos los arreglos del inicio
	* para llevar a cabo el logueo se usan las credenciales del localStorage
	*/
	loginWithOutMoveToLoginPage(): Observable<any>{
		let credentials: UserCredentials = {
		    enrollmentId: COMMON_WORDS.EMPTY_CHAR,
		    password: COMMON_WORDS.EMPTY_CHAR
		};
		credentials.enrollmentId = localStorageModifications.getUser();
		credentials.password = this._EncoderDecoderService.b64_to_utf8(localStorageModifications.getPassword());
		
		//console.log(credentials);

		console.log("logueando...")
    	localStorageModifications.changeLoading(BOOLEAN_VAL.TRUE);
		this._DbPetitionsService.login(credentials).subscribe(
			(loginResp) => {
				var resp = loginResp;

	        if (resp){
	        	//seteo needLoadArrays para que no se vuelva a llamar este metodo
	        	this.needLoadArrays = false;
				//creo los arreglos para los filtros
				let doctors: any[];
				let services: any[];
				let coverages: any[];
				let client: any[];
				//seteo los arreglos con la respuesta del servicio
				doctors = resp.conexion.data.medicos;
				services = resp.conexion.data.servicios;
				coverages = resp.conexion.data.coberturas;
				client = resp.usuario.fuenteDatos;
				//seteo los arreglos en el appcomponent
				this.setDoctors(doctors);
				this.setServices(services);
				this.setCoverages(coverages);
				this.setClients(client);
				//seteo todos los datos en el localStorage
				localStorageModifications.changeRelog(BOOLEAN_VAL.TRUE);
				localStorageModifications.changeLogged(BOOLEAN_VAL.TRUE);
				localStorageModifications.changeRelog(BOOLEAN_VAL.TRUE);
	        	localStorageModifications.changeLoading(BOOLEAN_VAL.FALSE);
				// localStorage.setItem('url',back.url);
				// if (localStorage.getItem('url') != null)  
				// this._router.navigate([localStorage.getItem('url')]);
				// else 
				//si hay una url guardada redirijo ahi, si no a my_turns
	        }
	        else{
	        	//en caso de no respuesta mensaje de error
	        	localStorageModifications.changeLoading(BOOLEAN_VAL.FALSE);
				alert(ERRORS.UPS);
	        }
			},
			(err) => {
				//en caso de error en el servicio pongo las variables del localstorage en false y muestro un error
				localStorageModifications.changeLoading(BOOLEAN_VAL.FALSE);
				localStorageModifications.changeLogged(BOOLEAN_VAL.FALSE);
				localStorageModifications.changeRelog(BOOLEAN_VAL.FALSE);
				let msg = ERRORS.UPS;
				if (err.message.includes(ERRORS.INCORRECT))
					msg = ERRORS.WRONG_ID;
				alert(msg);
				this.router.navigate([PAGES.LOGIN]);

	      	});

		return new Observable();
	}


}


