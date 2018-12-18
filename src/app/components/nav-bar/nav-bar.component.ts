import { Component, OnInit } from '@angular/core';
import { AppComponent } from '../../app.component';
import { DbPetitionsService } from '../../providers/db-petitions.service';
import { Router } from '@angular/router';
import { PAGES, STATE_TURN_LETTER, COMMON_WORDS, ERRORS, BOOLEAN_VAL } from '../../constants';
import { Filter } from '../../models/filter';
import { localStorageModifications } from '../../models/localStorageFx'


@Component({
  selector: 'navBar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.css'],
  providers: [ DbPetitionsService ]
})
export class NavBarComponent implements OnInit {

	//en estas 2 variables almaceno el usuario actual y los clientes disponibles respectivamente
	user = null;
	private clients: any[] = null;

	constructor(
              private _appComponent: AppComponent,
              private _dbPetitions: DbPetitionsService,
              private _router: Router
              ){
		if (this.clientsExists()){//seteo las variables solo en el caso de que el cliente ya este seteado
	      this.user = this._appComponent.getCurrentClient().nombreFuente;
	      this.clients = this._appComponent.getClients(); 
	  	}
	}

	ngOnInit() {}


	clientsExists(){
    
	    if (this._appComponent.getClients()){
	      this.user = this._appComponent.getCurrentClient().nombreFuente;
	      this.clients = this._appComponent.getClients(); 
	    }
	    return (this.clients != null);
	}


	logout(){
    //reinicio a needLoadArrays para que se vuelvan a cargar los arreglos
    this._appComponent.needLoadArrays = true;
		//reinicio el filtro completamente
	    this._appComponent.filter = new Filter(COMMON_WORDS.EMPTY_CHAR, 
	    										COMMON_WORDS.EMPTY_CHAR, 
	    										COMMON_WORDS.EMPTY_CHAR, 
	    										COMMON_WORDS.EMPTY_CHAR, 
	    										COMMON_WORDS.EMPTY_CHAR, 
	    										STATE_TURN_LETTER.ALL,
	    										COMMON_WORDS.EMPTY_CHAR,
	    										COMMON_WORDS.EMPTY_CHAR
	    									);
	    //limpio el localStorage y le seteo las variables al estado que tienen que estar luego del logout
	    localStorageModifications.clear();
	    localStorageModifications.changeLogged(BOOLEAN_VAL.FALSE);
	    localStorageModifications.changeLoading(BOOLEAN_VAL.FALSE);
	    localStorageModifications.changeRelog(BOOLEAN_VAL.FALSE);
	  	
  	}

  	

 	isLogged(){
    return localStorageModifications.getLogged();
  }

  isLoading():boolean{
    return localStorageModifications.getLoading();
  }


  //en value viene el nombre del cliente nuevo
  changeClient(value)
    {
      let c: string = value;
      console.log("El cliente nuevo sera: " + c);
      let r;
      //prueba cargar ese cliente
      this._dbPetitions.connectToClient(c).subscribe(
        (dbpet)=>{
          r = dbpet;
          localStorageModifications.changeLoading(BOOLEAN_VAL.TRUE);
          if (r){
            if (r.error){
              if (r.error.message.includes(ERRORS.NEED_RELOG)){
                alert(ERRORS.NEED_RELOG);
                localStorageModifications.clear();
                localStorageModifications.changeLogged(BOOLEAN_VAL.FALSE);
                this._router.navigate([PAGES.LOGIN]);
              }
              else alert(r.error.message);
            }
            else {
              alert ('cambiado con exito a: ' + dbpet.data.cliente);
              // si hizo el cambio le seteo todos los arreglos al appcomponent
              //console.log(r);
              this.user = c;

              let doctors: any[];
              let services: any[];
              let coverages: any[];
              doctors = dbpet.data.medicos;
              services = dbpet.data.servicios;
              coverages = dbpet.data.coberturas;
              this._appComponent.setDoctors(doctors);
              this._appComponent.setServices(services);
              this._appComponent.setCoverages(coverages);


              /*
              let client: any[];
              client = dbpet.data.other.cliente;
              this._appComponent.setClients(client);
              */
             

              //reinicio el filtro
              this._appComponent.filter = new Filter(COMMON_WORDS.EMPTY_CHAR, 
                          COMMON_WORDS.EMPTY_CHAR, 
                          COMMON_WORDS.EMPTY_CHAR, 
                          COMMON_WORDS.EMPTY_CHAR, 
                          COMMON_WORDS.EMPTY_CHAR, 
                          STATE_TURN_LETTER.ALL,
                          COMMON_WORDS.EMPTY_CHAR,
                          COMMON_WORDS.EMPTY_CHAR
                        );

              //redirijo a my turns por defecto
              this._router.navigate([PAGES.MY_TURNS]);
              //muestro el user actual 
              document.getElementById('usr').innerHTML = 'Conectado a <strong>' + this.user + '</strong>';
              // localStorage.setItem('reload','true');
            }
            localStorageModifications.changeLoading(BOOLEAN_VAL.FALSE);

          }},
        (err)=>{//si el cliente no existe limpio el localstorage y mando al login
                alert(ERRORS.CLIENT_NOT_EXISTS);
                localStorageModifications.clear();
                localStorageModifications.changeLogged(BOOLEAN_VAL.FALSE);
                this._router.navigate([PAGES.LOGIN]);
        });
   }

}
