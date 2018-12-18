import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppComponent } from '../../app.component';
import { User } from '../../models/user';
import { localStorageModifications } from '../../models/localStorageFx';
import { EncoderDecoderService } from '../../providers/encoder-decoder.service';
import { DbPetitionsService } from '../../providers/db-petitions.service';
import { BOOLEAN_VAL, COMMON_WORDS, PAGES, ERRORS } from '../../constants';
import { UserCredentials } from '../../interfaces';

@Component({
  selector: 'login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  providers: [ EncoderDecoderService, DbPetitionsService ]
})
export class LoginComponent implements OnInit {

	//para guardar la cuenta si es relog
	acc: User;
	//para el servicio de login
	private account: UserCredentials = {
	    enrollmentId: COMMON_WORDS.EMPTY_CHAR,
	    password: COMMON_WORDS.EMPTY_CHAR
	};

	constructor(
		private router: Router,
		private appComponent: AppComponent,
		private _DbPetitionsComponent: DbPetitionsService,
		private _EncoderDecoder: EncoderDecoderService
	){
		this.acc = new User("","",false);
	}

	ngOnInit() {
		//limpio el intervalo global
	    clearInterval(this.appComponent.interval);

	    /*if (localStorage.getItem('checked') != null)
	      back.chk = localStorage.getItem('checked');
	    if (localStorage.getItem('user') != null)
	      back.usr = localStorage.getItem('user');
	    if (localStorage.getItem('password') != null)
	      back.psw = localStorage.getItem('password');
	    if (localStorage.getItem('loading') != null)
	      back.loading = localStorage.getItem('loading');
	    if (localStorage.getItem('logged') != null)
	      back.logged = localStorage.getItem('logged');
	    if (localStorage.getItem('relog') != null)
	      back.relog = localStorage.getItem('relog');*/

	    // if (localStorage.getItem('url') != null)
	      // back.url = localStorage.getItem('url');
	    

	    //let a = e.utf8_to_b64("back.psw"); // "4pyTIMOgIGxhIG1vZGU="
	    //let b = e.b64_to_utf8(a);
	    if (localStorageModifications.getChecked() == BOOLEAN_VAL.FALSE)
			localStorageModifications.changeLogged(BOOLEAN_VAL.FALSE);
		
	    if (localStorageModifications.getChecked() == BOOLEAN_VAL.TRUE 
	    	&& localStorageModifications.getLogged()){

			localStorageModifications.changeLogged(BOOLEAN_VAL.FALSE);
			localStorageModifications.changeRelog(BOOLEAN_VAL.TRUE);
	    	
	    }
	    else {
	    	localStorageModifications.changeLogged(BOOLEAN_VAL.FALSE);
	    	//localStorage.setItem('logged', back.logged);

        	// localStorage.setItem('url',back.url);
	    }
	    
	  
	    //si es un caso de relog cargo las credenciales y llamo al login
	    if (localStorageModifications.getRelog() == BOOLEAN_VAL.TRUE){
	     // this.acc.checked = back.chk;
	      this.acc.password = this._EncoderDecoder.b64_to_utf8(localStorageModifications.getPassword());
	      this.acc.user = localStorageModifications.getUser();
	      this.login();  
	    }

	    localStorageModifications.changeLogged(BOOLEAN_VAL.FALSE);
	    // localStorage.setItem('loading','false');
  	}

	  


  	login(){ 
    
	    //this.acc.password = this.encoder.utf8_to_b64(this.acc.password);

	    localStorageModifications.changeLoading(BOOLEAN_VAL.TRUE);
	    //cargo la account que le paso al servicio
	    this.account.enrollmentId = this.acc.user;
	    this.account.password = this.acc.password;
	    var resp;
	   // console.log(this.acc.password);
	    console.log('logging..');
	    this._DbPetitionsComponent.login(this.account).subscribe(
	      (loginresp) =>{
	        resp = loginresp;

	        if (resp){
	        	//seteo needLoadArrays para que no intente recargar los arreglos
	        	this.appComponent.needLoadArrays = false;
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
				this.appComponent.setDoctors(doctors);
				this.appComponent.setServices(services);
				this.appComponent.setCoverages(coverages);
				this.appComponent.setClients(client);
				//seteo todos los datos en el localStorage
				localStorageModifications.changeUser(this.acc.user);
				localStorageModifications.changeChecked(this.acc.checked);
				localStorageModifications.changeRelog(BOOLEAN_VAL.TRUE);
				localStorageModifications.changePassword(this._EncoderDecoder.utf8_to_b64(this.acc.password));
				localStorageModifications.changeLogged(BOOLEAN_VAL.TRUE);
				localStorageModifications.changeRelog(BOOLEAN_VAL.TRUE);
	        	localStorageModifications.changeLoading(BOOLEAN_VAL.FALSE);
				// localStorage.setItem('url',back.url);
				// if (localStorage.getItem('url') != null)  
				// this._router.navigate([localStorage.getItem('url')]);
				// else 
				//si hay una url guardada redirijo ahi, si no a my_turns
				if (localStorageModifications.getURL() != null)
					this.router.navigate([localStorageModifications.getURL()]);
				else{
					console.log(localStorageModifications.getURL())
					this.router.navigate([PAGES.MY_TURNS]);
				}
				
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

	      });    
 	}



}
