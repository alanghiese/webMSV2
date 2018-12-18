import { Component, OnInit } from '@angular/core';
import { AppComponent } from '../../app.component';
import { localStorageModifications } from '../../models/localStorageFx';
import { BOOLEAN_VAL, PAGES, ERRORS, COMMON_WORDS, VALUES_GROUP_BY } from '../../constants';
import { tuple, turnosV0 } from '../../interfaces';
import { Router } from '@angular/router';
import { DbPetitionsService } from '../../providers/db-petitions.service';
import { ExcelService } from '../../providers/excel.service';

@Component({
  selector: 'turns',
  templateUrl: './turns.component.html',
  styleUrls: ['./turns.component.css'],
  providers: [ DbPetitionsService, ExcelService ]
})
export class TurnsComponent implements OnInit {


	//variables
	private turnsReady: boolean = false; // para el cargando mientras trae datos de la db
	private backSince = null; //para saber si hay cambios en la fecha y asi no llamar al servicio de gusto
	private backUntil = null; //para saber si hay cambios en la fecha y asi no llamar al servicio de gusto
	private allCoverages:string[] = [];//lista de nombres repetidos de coberturas
	private allServices:string[] = [];//lista de nombres repetidos de servicios
	private allDoctors:string[] = [];//lista de nombres repetidos de doctores
	private finalCoverage: tuple[] = []; //tupla (nombre, contador, porcentaje) de todas las coberturas
	private finalService: tuple[] = []; //tupla (nombre, contador, porcentaje) de todos los servicios
	private finalDoctors: tuple[] = [];//tupla (nombre, contador, porcentaje) de todos los doctores
	private valueGroupBy: any = "Cobertura"; //valor por el cual agrupa los datos en la tabla
	private turns: turnosV0[] = []; //turnos totales	
	private nameOfCoverages: string[] = []; //nombre sin repetir de coberturas
	private nameOfServices: string[] = []; //nombre sin repetir de servicios
	private nameOfDoctors: string[] = []; //nombre sin repetir de doctores
	private userPersentage: string = COMMON_WORDS.EMPTY_CHAR; // porcentaje personalizado por el usuario
	private stackP: boolean = true; //define si se stackea por el porcentaje o no
	private keepData: boolean = false; //define si el usuario quiere o no mantener los datos cargados en la tabla

  	constructor(
		private appComponent: AppComponent,
		private router: Router,
		private _dbPetitions: DbPetitionsService,
		private excelService:ExcelService
		){}


  	ngOnInit() {
  		//limpio el intervalo global
		clearInterval(this.appComponent.interval);
		
		localStorageModifications.cleanURL();
		if (!localStorageModifications.getLogged()){//si no esta logueado lo lleva al login
			localStorageModifications.changeURL(PAGES.TURNS);
        	this.router.navigate([PAGES.LOGIN]);
		}
		
    	else{
				if (this.appComponent.needLoadArrays)
			        this.appComponent.loginWithOutMoveToLoginPage().subscribe(
			          (resp) =>{
			            let resp2 = resp;
			            if (resp2)
			              this.loadAll();
			          },
			          (err)=>{
			            localStorageModifications.changeLoading(BOOLEAN_VAL.FALSE);
			            localStorageModifications.changeLogged(BOOLEAN_VAL.FALSE);
			            localStorageModifications.changeRelog(BOOLEAN_VAL.FALSE);
			            let msg = ERRORS.UPS;
			            if (err.message.includes(ERRORS.INCORRECT))
			              msg = ERRORS.WRONG_ID;
			            alert(msg);
			            localStorageModifications.changeURL(PAGES.REAL_TIME);
			            this.router.navigate([PAGES.LOGIN]);
			          });
			      else
			        this.loadAll();
    		}

    	
        
	}

	//abstraccion del cargar todo

	loadAll(){
		let array: any; //defino el array donde voy a cargar los datos de la db
		let from = this.convertToDate(this.appComponent.filter.selSince); //obtengo la fecha del filtro
		let to = this.convertToDate(this.appComponent.filter.selUntil); //obtengo la fecha del filtro
		this._dbPetitions.getStatistics(from, to).subscribe( (resp) => {
			// this._dbPetitions.getStatic().subscribe( (resp) => {   
				
				array = resp;
				console.log('cargando datos en el arreglo...')
				if (resp){
					console.log('cargado!');

					this.prepareArray(array); // carga el array turns
					this.filterFunction(); // aca extraigo los nombres y ademas finalizo los arreglos

					this.turnsReady = true;
					
				}
			},
			(err)=>{
				let msg = ERRORS.UPS;
	          	if (err.message.includes(ERRORS.SESSION_EXPIRED)){
	          		msg = ERRORS.NEED_RELOG;
	          		localStorageModifications.changeLogged(BOOLEAN_VAL.FALSE);
					localStorageModifications.changeURL(PAGES.TURNS);
	          		this.router.navigate([PAGES.LOGIN]);
	          	}
	            

	          	alert(msg);
			});
		this.backSince = this.appComponent.filter.selSince;
        this.backUntil = this.appComponent.filter.selUntil;	
	}


	//exporta a excel
	exportAsXLSX():void {
		if (this.coverage())
			this.excelService.exportAsExcelFile(this.finalCoverage, 'Turnos agrupados por coberturas');
		else if (this.service())
			this.excelService.exportAsExcelFile(this.finalService, 'Turnos agrupados por servicios');
		else if (this.doctor())
			this.excelService.exportAsExcelFile(this.finalDoctors, 'Turnos agrupados por medicos');
	}

	prepareArray(array: turnosV0[]){
		this.turns = [];
		let intC;
		if(!array.length){ //esta primera parte es por si no devuelve un arreglo
			let c;
			for (var i in array) {
				if (parseInt(i))
					c = i;
			}
		intC = parseInt(c); 
		}
		else intC = array.length; //en caso de que devuelva el arreglo ya esta

		for (let k = 0; k < intC ; k++)
			this.turns.push(array[k]);	//cargo todos los datos de la db en turns	
	}

	//retorna el numero de turnos cargados
	getNumberOfTurns():number{
		if (this.coverage())
			return this.allCoverages.length;
		else if (this.service())
			return this.allServices.length;
		else 
			return this.allDoctors.length;
	}

	//prepara los arreglos para el uso luego
	prepararArreglos(array:turnosV0[]){

		//reinicio los arreglos
		this.allCoverages = [];
		this.allServices = [];
		this.allDoctors = [];
		//seteo el servicio o doctor y cobertura (puede ser "sin cobertura")
		for (var i = 0; i < array.length; ++i) {
            if (array[i].campo6.trim()==COMMON_WORDS.EMPTY_CHAR)
                this.allCoverages.push(COMMON_WORDS.NO_COVERAGE);
            else
			    this.allCoverages.push(array[i].campo6);
			this.allServices.push(array[i].campo7);
			this.allDoctors.push(array[i].campo1);
		}
		//ordeno los arreglos
		this.allCoverages.sort(function(a,b){
			if (a<b)
				return -1;
			else return 1;
		});

		this.allDoctors.sort(function(a,b){
			if (a<b)
				return -1;
			else return 1;
		});

		this.allServices.sort(function(a,b){
			if (a<b)
				return -1;
			else return 1;
		});
	}


	extractNames(){
		//reinicio los arreglos
		this.nameOfCoverages = [];
		this.nameOfServices = [];
		this.nameOfDoctors = [];
		let backCov = COMMON_WORDS.EMPTY_CHAR;
		let backSer = COMMON_WORDS.EMPTY_CHAR;
		let backDoc = COMMON_WORDS.EMPTY_CHAR;
		/*
		* todas las comparaciones de abajo estan hechas siempre con el valor anteriormente guardado
		* esto lo puedo hacer porque cuando cargue los datos ordene por nombre
		* entonces nunca se va a dar que un mismo valor aparezca intercalado con otro
		*/
		if (this.allCoverages.length>0){
			backCov = this.allCoverages[0];
			if (backCov.trim() == COMMON_WORDS.EMPTY_CHAR)
				this.nameOfCoverages.push(COMMON_WORDS.NO_COVERAGE);
			else
				this.nameOfCoverages.push(this.allCoverages[0]);
		}
		
		if (this.nameOfServices.length>0){
			backSer = this.allServices[0];
			this.nameOfServices.push(this.allServices[0]);
		}
		

		if (this.nameOfDoctors.length>0){
			backSer = this.allDoctors[0];
			this.nameOfDoctors.push(this.allDoctors[0]);
		}

		for (var i = 0; i < this.allCoverages.length; i++) {
			if (this.allCoverages[i] == COMMON_WORDS.EMPTY_CHAR 
				&& backCov != COMMON_WORDS.NO_COVERAGE){              //aca contemplo si es una cobertura vacia
				this.nameOfCoverages.push(COMMON_WORDS.NO_COVERAGE);  //ya que estas no harian matching en el else if
				backCov = COMMON_WORDS.NO_COVERAGE;                   //ademas el push es de NO_COVERAGE y no de lo que hay
			}                                                         //en el array nameOfCoverages
			else if (this.allCoverages[i].trim() != backCov.trim()){
				this.nameOfCoverages.push(this.allCoverages[i]);
				backCov = this.allCoverages[i];
			}
		}

		for (var k = 0; k < this.allServices.length; k++) {
			if (this.allServices[k].trim() != backSer.trim()){
				this.nameOfServices.push(this.allServices[k]);
				backSer = this.allServices[k];
			}
		}

		for (var k = 0; k < this.allDoctors.length; k++) {
			if (this.allDoctors[k].trim() != backDoc.trim()){
				this.nameOfDoctors.push(this.allDoctors[k]);
				backDoc = this.allDoctors[k];
			}
		}
	}

	//cuenta los valueToCompare en array
	count(valueToCompare: string, array: string[]):number{
		let count = 0;
		for (var i = 0; i < array.length; i++) {
			if (array[i] == valueToCompare)
				count++;
		}
		return count;
	}

	//crea los arreglos finales
	finalizeArrays(){
		//reinicia los arreglos
		this.finalCoverage = [];
		this.finalService = [];
		this.finalDoctors = [];

		for (var i = 0; i < this.nameOfCoverages.length; i++) {
			let t: tuple = {
				name:'',
				count: 0,
				percentage: 0
			};
			t.name = this.nameOfCoverages[i];
			t.count = this.count(this.nameOfCoverages[i],this.allCoverages);
			t.percentage = parseFloat((100*t.count/this.allCoverages.length).toFixed(2));
			this.finalCoverage.push(t);
		}

		for (var j = 0; j < this.nameOfServices.length; j++) {
			let t: tuple = {
				name:'',
				count: 0,
				percentage: 0
			};
			t.name = this.nameOfServices[j];
			t.count = this.count(this.nameOfServices[j],this.allServices);
			t.percentage = parseFloat((100*t.count/this.allServices.length).toFixed(2));
			this.finalService.push(t);
		}

		for (var j = 0; j < this.nameOfDoctors.length; j++) {
			let t: tuple = {
				name:'',
				count: 0,
				percentage: 0
			};
			t.name = this.nameOfDoctors[j];
			t.count = this.count(this.nameOfDoctors[j],this.allDoctors);
			t.percentage = parseFloat((100*t.count/this.allDoctors.length).toFixed(2));
			this.finalDoctors.push(t);
		}


		if (this.finalCoverage.length>1)
			this.finalCoverage.sort(
				function(a,b){
					return b.percentage - a.percentage;
				}
			);

		if (this.finalService.length>1)
			this.finalService.sort(
				function(a,b){
					return b.percentage - a.percentage;
				}
			);

		if (this.finalDoctors.length>1)
			this.finalDoctors.sort(
				function(a,b){
					return b.percentage - a.percentage;
				}
			);


		if (this.stackP){
			let coverageCeil = 0;
			let serviceCeil = 0;
			let doctorCeil = 0;
			//calculo los porcentajes predeterminados
			if (this.finalCoverage.length>1)
				coverageCeil = Math.ceil(this.finalCoverage[Math.floor(this.finalCoverage.length/2)].percentage);
			if (this.finalService.length>1)
				serviceCeil = Math.ceil(this.finalService[Math.floor(this.finalService.length/2)].percentage);
			if (this.finalDoctors.length>1)
				doctorCeil = Math.ceil(this.finalDoctors[Math.floor(this.finalDoctors.length/2)].percentage);

			//si el usuario seteo uno particular uso ese
			if (this.userPersentage != COMMON_WORDS.EMPTY_CHAR){
				coverageCeil = parseFloat(this.userPersentage);
				serviceCeil  = parseFloat(this.userPersentage);
				doctorCeil  = parseFloat(this.userPersentage);
			}
			// if (this.finalService.length > 1)
			this.stackPercentages(coverageCeil,serviceCeil,doctorCeil);
		}
	}

	stackPercentages(coverageCeil,serviceCeil,doctorCeil){
		//hago un back up de finalcoverage
		let arrAux = this.finalCoverage;
		let percentageAux = 0;
		let countAux = 0;
		if (this.finalCoverage.length > 1){
			//vacio el arreglo
			this.finalCoverage = [];
			/*
			* ahora aux tiene lo que tenia finalcoverage 
			* y solo le voy a pasar los datos que superen el porcentaje
			*/
			for (var i = 0; i < arrAux.length; i++) {
				if (arrAux[i].percentage >= coverageCeil){
					this.finalCoverage.push(arrAux[i]);
				}
				else{
					percentageAux = percentageAux + arrAux[i].percentage;
					countAux = countAux + arrAux[i].count;	
				}
			}
			let t: tuple = {
				name:'',
				count: 0,
				percentage: 0
			};
			t.name = 'Turnos con porcentajes menores a '+coverageCeil+'%';
			t.percentage = parseFloat(percentageAux.toFixed(2));
			t.count = countAux;
			this.finalCoverage.push(t);
		}

		arrAux = this.finalService;
		percentageAux = 0;
		countAux = 0;
		if (this.finalService.length > 1){
			this.finalService = [];
			for (var i = 0; i < arrAux.length; i++) {
				if (arrAux[i].percentage >= serviceCeil){
					this.finalService.push(arrAux[i]);
				}
				else{
					percentageAux = percentageAux + arrAux[i].percentage;
					countAux = countAux + arrAux[i].count;	
				}
			}
			let t: tuple = {
				name:'',
				count: 0,
				percentage: 0
			};
			t.name = 'Turnos con porcentajes menores a '+serviceCeil+'%'
			t.percentage = parseFloat(percentageAux.toFixed(2));
			t.count = countAux;
			this.finalService.push(t);
		}

		arrAux = this.finalDoctors;
		percentageAux = 0;
		countAux = 0;
		if (this.finalDoctors.length > 1){
			this.finalDoctors = [];
			for (var i = 0; i < arrAux.length; i++) {
				if (arrAux[i].percentage >= doctorCeil){
					this.finalDoctors.push(arrAux[i]);
				}
				else{
					percentageAux = percentageAux + arrAux[i].percentage;
					countAux = countAux + arrAux[i].count;	
				}
			}

			let t: tuple = {
				name:'',
				count: 0,
				percentage: 0
			};
			t.name = 'Turnos con porcentajes menores a '+doctorCeil+'%'
			t.percentage = parseFloat(percentageAux.toFixed(2));
			t.count = countAux;
			this.finalDoctors.push(t);
		}	
	}

	//filter y filterFunction funcionan de forma similar a las de graphs
  	filter(){
  		if (this.backSince != this.appComponent.filter.selSince || this.backUntil != this.appComponent.filter.selUntil){
  			this.turnsReady = false;
	  		// this._dbPetitions.getStatic().subscribe((resp)=>{ //sacar si uso la peticion en tiempo real
	  		this._dbPetitions.getStatistics(this.convertToDate(this.appComponent.filter.selSince),
  									this.convertToDate(this.appComponent.filter.selUntil)
  			).subscribe((resp)=>{
	        		if (resp){
	        			this.prepareArray(resp);

	        			this.filterFunction();
	        			this.backSince = this.appComponent.filter.selSince;
	        			this.backUntil = this.appComponent.filter.selUntil;
	        			this.turnsReady = true;

	        		}
	        	},
			(err)=>{
				let msg = ERRORS.UPS;
	          	if (err.message.includes(ERRORS.SESSION_EXPIRED)){
	          		msg = ERRORS.NEED_RELOG;
	          		localStorageModifications.changeLogged(BOOLEAN_VAL.FALSE);
	          		localStorageModifications.changeURL(PAGES.TURNS);
	          		this.router.navigate([PAGES.LOGIN]);
	          	}
	            

	          	alert(msg);
			});
  		}
	  	else{
	  		this.turnsReady = false;
	  		this.filterFunction();
	  		this.turnsReady = true;
	  	}
  	}

  	filterFunction(){
  		//FILTROS
		let backCoverages: any[] = [];
		let backServices: any[] = [];
		let backDoctors: any[] = [];
		if (this.keepData){
			backCoverages = this.allCoverages;
			backServices = this.allServices;
			backDoctors = this.allDoctors;
		}
		
		let arraySol = this.appComponent.filter.filter(this.turns);
		let finalArraySol: any[] = this.appComponent.filter.filterState(arraySol);

		this.prepararArreglos(finalArraySol); 
		// console.log(this.keepData)
		if (this.keepData){
			for (var i = 0; i < backCoverages.length; i++) {
				this.allCoverages.push(backCoverages[i]);
			}
			for (var i = 0; i < backServices.length; i++) {
				this.allServices.push(backServices[i]);
			}


			for (var i = 0; i < backDoctors.length; i++) {
				this.allDoctors.push(backDoctors[i]);
			}
		}

		this.extractNames();
		this.finalizeArrays();
  	}

  	//convierte de un string YYYY-MM-DD a objeto tipo date
  	convertToDate(date:String):Date{
		// console.log(date);
		let d = new Date();
		//YYYY-MM-DD
		let second = date.lastIndexOf('-');
		let first = date.indexOf('-')
		let year = parseInt(date.substr(0,first));
		let month = parseInt(date.substr(first+1,second))-1;
		let day = parseInt(date.substr(second+1,date.length));

		d.setFullYear(year);
		d.setMonth(month);
		d.setDate(day);
		return d;

	}

	//turnos cargados o no
	isReady(){
		return this.turnsReady;
	}

	//mantiene la variable que indica la seleccion de agrupacion del usuario actualizada
	onChangeGroupBy(value:any){
		this.valueGroupBy = value;
	}


	coverage():boolean{
		return this.valueGroupBy == VALUES_GROUP_BY.COV;
	}

	service():boolean{
		return this.valueGroupBy == VALUES_GROUP_BY.SER;
	}

	doctor():boolean{
		return this.valueGroupBy == VALUES_GROUP_BY.DOC;
	}



}//fin de la clase
