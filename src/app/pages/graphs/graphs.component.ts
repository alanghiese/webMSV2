import { Component, OnInit } from '@angular/core';
import { AppComponent } from '../../app.component'
import { ExcelService } from '../../providers/excel.service';
import { DbPetitionsService } from '../../providers/db-petitions.service';
import { localStorageModifications } from '../../models/localStorageFx';
import { PAGES, BOOLEAN_VAL, ERRORS, COMMON_WORDS, STATE_TURN_WORD, STATE_TURN_LETTER, SUBTOPIC } from '../../constants';
import { Router } from '@angular/router';
import { arrayManipulations } from '../../models/arrayManipulations';
import { turnosV0, regStatistics, webVSdesktop } from '../../interfaces';

@Component({
  selector: 'graphs',
  templateUrl: './graphs.component.html',
  styleUrls: ['./graphs.component.css'],
  providers: [ ExcelService, DbPetitionsService ]
})
export class GraphsComponent implements OnInit {

	//variables
	private arrayManipulationsOBJ: arrayManipulations; //carga y prepara los arreglos
	private turnsCompleteds: turnosV0[] = []; //todos los turnos, se cargan en los llamados a servicios
	/*version mas restringida del anterior ya que esta filtrado por todo 
	* (inclusive por el estado)
	*/
	private newTurnsFilter: turnosV0[] = []; 
	private delaysDoctors: regStatistics[] = []; //arreglo con los doctores, contadores y promedios del mismo 
	/* arreglo con los doctores, contadores y promedios del mismo
	* este arreglo corresponde a los filtrados por estado
	*/
	private delaysWithStateFilter: regStatistics[] = [];
	//arreglo con las contadoras de cantidad de turnos web y desktop
	private webVSdesktopArr: webVSdesktop[] = []; 
	//se usa para saber si la carga de datos esta completa, para no mostrar un cartel
	private turnsReady: boolean = false; 
	/*
	* Estoas 2 variables las seteo por primera vez en el ngOnInit y me sirven para no tener
	* que llamar al servicio cada vez que pasa por filter, es decir, si ninguna fecha cambio, no hay nuevos
	* datos si no que hay que re-filtralos desde turnsCompleteds
	*/
	private backSince: any = null;
	private backUntil: any = null;
	//permite ocultar la tabla de web vs desktop en la seccion web vs desktop

	private showTableWebVsDesktop: boolean = false;
	/*
	* para el modal de los delays, ademas se van cargando 
	* los datos de los pacientes que luego van a ser exportados a un acrchivo
	*/ 
	private arrayPatients: turnosV0[] = []; 
	//variable que marca si hay que guardar los datos actuales del filtrado o vaciar los arreglos
	public keepData: boolean = false;
	private arraySol: turnosV0[] = []; //array que contiene todos los datos para delaysDoctors
	//estas dos variables sirven para mostrar la cantidad de datos cargados
	private totalDelays: number = 0;
	private totalOthers: number = 0;
	private stack = false; //para juntar/separar las barras de los graficos
	//para que en el html el usuario sepa de quien son los datos que va a ver en el modal
	private nameButton = "Nadie";
	//define que tipo de grafico voy a mostrar, por defecto el 1
	public graphtype: string = '1';





	
	constructor(
		private router: Router,
		private appComponent: AppComponent,
		private dbPetitions: DbPetitionsService,
		private _excelService:ExcelService
	){}	


	ngOnInit() {
		//borro el intervalo
		clearTimeout(this.appComponent.interval);

		//inicializo arrayManipulationsOBJ
		this.arrayManipulationsOBJ = new arrayManipulations();
		
		localStorageModifications.cleanURL();

		//verifico si esta logueado antes de hacer cualquier cosa
		if (!localStorageModifications.getLogged()){
			localStorageModifications.changeURL(PAGES.GRAPHS);
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
						localStorageModifications.changeURL(PAGES.GRAPHS);
						this.router.navigate([PAGES.LOGIN]);
					});
			else
				this.loadAll();
        	
        }
        
	}


	//load abstraido
	loadAll(){
		console.log('cargando turnos...');	

      		
      		//obtengo las fechas del filtro y le seteo horas predeterminadas (0)
        	let from = this.convertToDate(this.appComponent.filter.selSince);
        	let to = this.convertToDate(this.appComponent.filter.selUntil);
        	from.setHours(0);
			from.setMilliseconds(0);
			from.setMinutes(0);
			to.setHours(0);
			to.setMilliseconds(0);
			to.setMinutes(0);

        	this.dbPetitions.getStatistics(from,to).subscribe((resp)=>{
        	// this.dbPetitions.getStatic().subscribe((resp)=>{ //sacar si uso la peticion en tiempo real
        		if (resp){
        			//preparo el arreglo de turnos completos y luego se lo seteo al arreglo local
        			this.arrayManipulationsOBJ.prepareArray(resp);
        			this.turnsCompleteds = this.arrayManipulationsOBJ.getTurnsCompleteds();        			
        			/*
        			* creo y calculo los arreglos de doctores y sus promedios, 
        			* luego seteo los delays en la variable local
        			*/
        			this.arrayManipulationsOBJ.prepareArrayDoctors(this.turnsCompleteds);
        			this.arrayManipulationsOBJ.doctorsAverage(this.turnsCompleteds);
	        		this.delaysDoctors = this.arrayManipulationsOBJ.getDelays();
	        		// obtengo la cantidad de turnos web y desktop para cada doctor
	        		this.webVSdesktopArr = this.arrayManipulationsOBJ.onlyCountWebDesktopTurns(this.turnsCompleteds);
	        		

	        		this.filterFunction();

        			this.turnsReady = true;
        		}
        	},
        	(err)=>{
				let msg = ERRORS.UPS;
	          	if (err.message.includes(ERRORS.SESSION_EXPIRED)){
	          		msg = ERRORS.NEED_RELOG;
	          		localStorageModifications.changeLogged(BOOLEAN_VAL.FALSE);
					localStorageModifications.changeURL(PAGES.GRAPHS);
	          		this.router.navigate([PAGES.LOGIN]);
	          	}
	            

	          	alert(msg);
			});
	        this.backSince = this.appComponent.filter.selSince;
	        this.backUntil = this.appComponent.filter.selUntil;
	}

	//retorna true si ya se ejecuto la accion actual
	isReady():boolean{
		return this.turnsReady;
	}

	//exporto a un excel los datos usando el _excelService
	exportAsXLSX():void {
		
		let arrayExcel = [{
			nombre_paciente: '',
			fecha_turno: '',
			hora_turno: '',
			hora_llegada: '',
			hora_atencion: ''
		}];


		for (var i = 0; i < this.arrayPatients.length; i++) {
			arrayExcel[i].nombre_paciente = this.arrayPatients[i].nomUsuario;
			arrayExcel[i].fecha_turno = this.arrayPatients[i].fecha1;
			arrayExcel[i].hora_turno = this.arrayPatients[i].campo2;
			arrayExcel[i].hora_llegada = this.arrayPatients[i].campo3;
			arrayExcel[i].hora_atencion = this.arrayPatients[i].campo4;

		}

		this._excelService.exportAsExcelFile(arrayExcel, 'Turnos de pacientes');
	}

	showTableWebvsDesktop():boolean{
		return this.showTableWebVsDesktop;
	}

	changeBooleanWebVsDesktop(){
		this.showTableWebVsDesktop = !this.showTableWebVsDesktop;
	}

	/*funcion con la llamada a los servicios 
	* y dentro la funcion de filtrar, es la que se llama en el boton de visualizar
	*/
  	filter(){
  		//corroboro que haya un cambio de fechas, en caso contrario no llamo al servicio
  		if (this.backSince != this.appComponent.filter.selSince || 
  			this.backUntil != this.appComponent.filter.selUntil){
  			//pongo la pantalla de carga
  			this.turnsReady = false;
	  		// this.dbPetitions.getStatic().subscribe((resp)=>{ //sacar si uso la peticion en tiempo real
	  		this.dbPetitions.getStatistics(this.convertToDate(this.appComponent.filter.selSince),
  											this.convertToDate(this.appComponent.filter.selUntil)
  											).subscribe((resp)=>
  				{
	        		if (resp){
	        			// es el mismo proceso que en el ngOnInit
	        			this.arrayManipulationsOBJ.prepareArray(resp);
	        			this.turnsCompleteds = this.arrayManipulationsOBJ.getTurnsCompleteds();
	        			this.delaysDoctors = this.arrayManipulationsOBJ.getDelays();
	        			this.filterFunction();
	        			this.backSince = this.appComponent.filter.selSince;
	        			this.backUntil = this.appComponent.filter.selUntil;
	        			//saco la pantalla de carga
	        			this.turnsReady = true;

	        		}
	        	},
        		(err)=>{
					let msg = ERRORS.UPS;
		          	if (err.message.includes(ERRORS.SESSION_EXPIRED)){
		          		msg = ERRORS.NEED_RELOG;
		          		localStorageModifications.changeLogged(BOOLEAN_VAL.FALSE);
		          		this.router.navigate([PAGES.LOGIN]);
		          	}
	          	});
  		}
	  	else{
	  		/*en este bloque else contemplo el hecho de que no haya cambio de fechas 
	  		* y ejecuto el filtro sin levantar datos nuevos de la db
	  		*/
	  		this.turnsReady = false;
	  		this.filterFunction();
	  		this.turnsReady = true;
	  	}
  	}

  	filterFunction(){
  		//si el usuario marco que quiere guardar los datos actuales hago un backup
		let backDelays: any[] = [];
		if (this.keepData)
			backDelays = this.delaysDoctors;
		/*elimino las tuplas que no tengan campo3 y campo4 seteado 
		* porque son los horarios y no puedo calcular nada sin estos
		*/
		let turnsAttended =  this.filterNewTurns(this.turnsCompleteds);
		/*filtro todos los datos con la funcion que da la clase filter
		* (usa los parametros definidos por el usuario)
		*/
    	this.arraySol = this.appComponent.filter.filter(turnsAttended);
    	//preparo el array de delays
		this.arrayManipulationsOBJ.prepareArrayDoctors(this.arraySol);
		this.arrayManipulationsOBJ.doctorsAverage(this.arraySol);
	    this.delaysDoctors = this.arrayManipulationsOBJ.getDelays();

	    //si el usuario queria guardar los datos agrego el backup a los datos actuales siempre que no esten ya
		if (this.keepData)
			for (var i = 0; i < backDelays.length; i++) {
				if (!this.contains(this.delaysDoctors, backDelays[i]))
					this.delaysDoctors.push(backDelays[i]);
			}

		//con el array obtenido preparo todas las variables necesarias para los graficos de delay
		this.prepareGraphicDelay(this.delaysDoctors);


		//backup del arreglo por si keepData
		let backDelaysState = this.delaysWithStateFilter;
		//aca ademas de los filtros comunes a todo filtro los datos por estado
		let turnsCompletedsWithStateFilter = this.appComponent.filter.filterState(this.turnsCompleteds);
		this.newTurnsFilter = this.appComponent.filter.filter(turnsCompletedsWithStateFilter);

		this.arrayManipulationsOBJ.prepareArrayDoctors(this.newTurnsFilter);
		this.arrayManipulationsOBJ.doctorsAverage(this.newTurnsFilter);
		//delays filtrados por estado
	    this.delaysWithStateFilter = this.arrayManipulationsOBJ.getDelays();

	    this.webVSdesktopArr = this.arrayManipulationsOBJ.onlyCountWebDesktopTurns(this.newTurnsFilter);

	    //si keepData agrego el backup si no esta ya en el arreglo
	    if (this.keepData)
			for (var i = 0; i < backDelaysState.length; i++) {
				if (!this.contains(this.delaysWithStateFilter, backDelaysState[i]))
					this.delaysWithStateFilter.push(backDelaysState[i]);
			}

	    //preparo el grafico de los turnos
		this.prepareGraphicTurns(this.delaysWithStateFilter);
		this.getStatesOfTurns(this.newTurnsFilter);

		//aca seteo las variables de cantidad de turnos cargados
		if (this.keepData){
			this.totalDelays = this.totalDelays + this.arraySol.length;
			this.totalOthers = this.totalOthers + turnsCompletedsWithStateFilter.length;
		}
		else{
			this.totalDelays = this.arraySol.length;
			this.totalOthers = this.newTurnsFilter.length;
		}
  	}

  	//un contains de toda la vida
  	contains(array: regStatistics[], valueToCompare: regStatistics){
  		for (var i = 0; i < array.length; i++) {
  			if (array[i].name.toUpperCase() == valueToCompare.name.toUpperCase())
  				return true;
  		}
  		return false;
  	}

  	//filtro las tuplas sin los campos "campo3" y "campo4"
  	filterNewTurns(array: turnosV0[]): turnosV0[]{
	    let arr: turnosV0[] = [];
	    for (var i = 0; i < array.length; i++) {
	      if(array[i].campo3 != '' && array[i].campo4 != '')
	        arr.push(array[i]);
	    }
	    return arr;
  	}

  	//convierto de un string con formato YYYY-MM-DD a un Date
  	convertToDate(date:String):Date{
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

	//funcion que devuelve la cantidad de turnos cargados segun el tipo de grafico
	getTotalTurns(){
		if (this.isDelay())
			return this.totalDelays;
		else 
			return this.totalOthers; 
	}

	/*
	* cada vez que se selecciona una opcion de tipo de grafico se puede o no mostrar el filtro de estado, 
	* aca lo seteo
	*/
	onChangeType(){
		this.nameButton = COMMON_WORDS.ANYBODY;
		if (this.isDelay())
			this.appComponent.stateFilter = false;
		else 
			this.appComponent.stateFilter = true;
	}


	//funciones booleanas para comparar que tipo de grafico voy a tener que mostrar

	

	isDelay():boolean{
		return this.graphtype == '1';
	}

	isWebVsDesktop():boolean{
		return this.graphtype == '2';
	}

	isState(): boolean{
		return this.graphtype == '3';
	}

	isStateCombinedWithWebVsDesktop():boolean{
		return this.graphtype == '4';
	}



	//ZONA DE GRAFICOS



	//variables de los graficos
	public nameOfTheDoctors:string[] = [];
	private nameOfTheDoctorsTurns:string[] = [];
	public datasOfTheDoctors:any[] = [];
	//las siguientes 4 son para  prepareGraphicTurns()
	private auxCountWeb = [];
	private auxCountDesktop = [];
	private minMax = [];
	private avgs = [];
	// variables para el grafico de torta de turnos
	public pieChartLabels:string[] = ['Turnos Web', 'Turnos Escritorio'];
  	public pieChartData:number[] = [];
  	public pieChartType:string = 'pie';
  	//datos de los turnos para graficos
  	private dataTurns:any[] = [];
  	//grafico de torta estado de turnos
	public stateLabels:string[] = ['Aun no se presentan', 'Atendidos', 'En sala de espera', 'Falto', 'Falto con aviso', 'En el consultorio'];
  	public stateData:number[] = [];
  	public attendedLabels: string[] = ['Atendidos: ', 'No atendidos: '];
  	//para las funciones contadoras de estados
  	private attendedWeb: any[] = [];
	private attendedDesktop: any[] = [];
	private combinedDataWeb: any[] = [];
	private combinedDataDesktop: any[] = [];
	//para la funcion del size de los graficos que van de a dos
	private sizeBoolean:boolean = true;



	//configuraciones generales para cualquier grafico
	public barChartType:string = 'bar';
	public barChartLegend:boolean = true;



	//limpia los arreglos para reiniciar los graficos
	clearCharts() {
		while (this.nameOfTheDoctors.length > 0)
			this.nameOfTheDoctors.pop();
		while (this.nameOfTheDoctorsTurns.length > 0)
			this.nameOfTheDoctorsTurns.pop();

	    this.datasOfTheDoctors= [
	      {data: [], label: 'label1'},
	      {data: [], label: 'label2'}
	    	];
	    this.dataTurns= [
	      {data: [], label: 'label1'},
	      {data: [], label: 'label2'}
	    	];
 	}

 	prepareGraphicDelay(array: regStatistics[]){
 		//reinicia los arreglos
		this.clearCharts();
		let auxAVGDoctors = [];
		let auxAVGPatients = [];

		//carga los arreglos para el grafico a partir del array del parametro (array filtrado)
		for (var i = 0; i < array.length; i++) {
			if (array[i].avgDoctor != 0 || array[i].avgPatient != 0){
				this.nameOfTheDoctors.push(array[i].name);
				auxAVGDoctors.push(array[i].avgDoctor);
				auxAVGPatients.push(array[i].avgPatient);
				
			}
			
		}
		//seteo los labels para cada uno de los arreglos de valores
		this.datasOfTheDoctors = [
						{data: auxAVGDoctors , label: 'Demora de doctores (en minutos)'},
						{data: auxAVGPatients , label: 'Demora de pacientes (en minutos)'}
						];
	}


	prepareGraphicTurns(delay: regStatistics[]){

		//reinicio los arreglos
		this.auxCountDesktop = [];
		this.auxCountWeb = [];
		this.pieChartData = [];
		
		//seteo los nombres de los doctores del arreglo del parametro
		for (var i = 0; i < delay.length; i++) {
			this.nameOfTheDoctorsTurns.push(delay[i].name);
		}

		/*
		* seteo las cantidades de turnos web y desktop del arreglo global
		* este arreglo lo cargue en el inicio o en la funcio filtro
		*/
		for (var k = 0; k < this.nameOfTheDoctorsTurns.length; k++) {
				this.auxCountDesktop.push(this.webVSdesktopArr[k].desktop);
				this.auxCountWeb.push(this.webVSdesktopArr[k].web);	
		}			

		this.dataTurns = [
							{data: this.auxCountWeb , label: 'Cantidad de turnos por web'},
							{data: this.auxCountDesktop , label: 'Cantidad de turnos por escritorio'}
						];



		let a = 0;

		for (var i = 0; i < this.auxCountDesktop.length; i++) {
			a = a + parseInt(this.auxCountDesktop[i]);
		}


		let b = 0;
		for (var k = 0; k < this.auxCountWeb.length; k++) {
			b = b + parseInt(this.auxCountWeb[k]);
		}
		//seteo los valores del grafico
		this.pieChartData = [b,a];
		//calculo minimos, maximos y promedios
		this.minMax = this.getMinAndMax(); //minweb, mindesktop, maxweb, maxdesktop
		this.avgs = this.getAVGs(); //avgweb, avgdesktop
	}

	//busca los minimos y maximos de las cantidades y las retorna en un arreglo de dimension 4
	getMinAndMax():number[]{
		let minWeb = this.auxCountWeb[0];
		let minDesktop = this.auxCountDesktop[0];

		let maxWeb = this.auxCountWeb[0];
		let maxDesktop = this.auxCountDesktop[0];

		for (var i = 1; i < this.auxCountWeb.length; i++) {
			if (this.auxCountWeb[i]>maxWeb)
				maxWeb = this.auxCountWeb[i]
			if (this.auxCountWeb[i]<minWeb)
				minWeb = this.auxCountWeb[i]

			if (this.auxCountDesktop[i]>maxDesktop)
				maxDesktop = this.auxCountDesktop[i]
			if (this.auxCountDesktop[i]<minDesktop)
				minDesktop = this.auxCountDesktop[i]
		}


		return [minWeb,minDesktop,maxWeb,maxDesktop];
	}

	//calculoa los promedios de las cantidades y las retorna en un arreglo de dimension 2
	getAVGs():any[]{
		let avgWeb = 0;
		let avgDesktop = 0;
		for (var i = 0; i < this.auxCountWeb.length; i++) {
			avgWeb = avgWeb + parseInt(this.auxCountWeb[i]);
			avgDesktop = avgDesktop + parseInt(this.auxCountDesktop[i]);
		}
		avgWeb = parseInt((avgWeb/this.auxCountWeb.length).toFixed(2));
		avgDesktop = parseInt((avgDesktop/this.auxCountDesktop.length).toFixed(2));
		return [avgWeb,avgDesktop];
	}

	//opciones para el grafico de delays
	public optionsDelays:any = {
	    scaleShowVerticalLines: false,
	    responsive: true,
	    scales: {
	    			yAxes: [{
                		ticks: {
                    		beginAtZero: true,
                    		maxTicksLimit: 5,
                    		// Create scientific notation labels
                    		callback: function(value, index, values) {
                        		return value + ' minutos';
                    		}
                }
            }],
		        	xAxes: [{
		            ticks: {
		                display: true,
		                // beginAtZero: true,
		                autoSkip: false,
                		// stepSize: 1,
                		// min: 0,
                		
                		maxRotation: 90,
                		minRotation: 90,
		                callback: function(value, index, values){
		                	return value.split(" ").join("\n");
		                }
		            	},
		            	stacked: this.stack

		        	}]
		    	}
	};

	//opciones para el grafico de turnos
	public optionsTurns:any = {
	    scaleShowVerticalLines: false,
	    responsive: true,
	    scales: {
	    			yAxes: [{
                		ticks: {
                    		beginAtZero: true,
                    		maxTicksLimit: 5,
                    		// Create scientific notation labels
                    		callback: function(value, index, values) {
                        		return value + ' turnos';
                    		}
                }
            }],
		        	xAxes: [{
		            ticks: {
		                display: true,
		                // beginAtZero: true,
		                autoSkip: false,
                		// stepSize: 1,
                		// min: 0,
                		
                		maxRotation: 90,
                		minRotation: 90,
		                callback: function(value, index, values){
		                	return value.split(" ").join("\n");
		                }
		            	},
		            	stacked: this.stack

		        	}]
		    	}
	};

	//esta funcion junta/separa las barras de los graficos
	stackBars(){
		this.stack = !this.stack;
		
		this.optionsDelays = {
		    scaleShowVerticalLines: false,
		    responsive: true,
		    scales: {
		    			yAxes: [{
	                		ticks: {
	                    		beginAtZero: true,
	                    		maxTicksLimit: 5,
	                    		// Create scientific notation labels
	                    		callback: function(value, index, values) {
	                        		return value + ' minutos';
	                    		}
	                }
	            }],
			        	xAxes: [{
			            ticks: {
			                display: true,
			                // beginAtZero: true,
			                autoSkip: false,
	                		// stepSize: 1,
	                		// min: 0,
	                		
	                		maxRotation: 90,
	                		minRotation: 90,
			                callback: function(value, index, values){
			                	return value.split(" ").join("\n");
			                }
			            	},
			            	stacked: this.stack

			        	}]
			    	}
			};	

		this.optionsTurns = {
		    scaleShowVerticalLines: false,
		    responsive: true,
		    scales: {
		    			yAxes: [{
	                		ticks: {
	                    		beginAtZero: true,
	                    		maxTicksLimit: 5,
	                    		// Create scientific notation labels
	                    		callback: function(value, index, values) {
	                        		return value + ' turnos';
	                    		}
	                }
	            }],
			        	xAxes: [{
			            ticks: {
			                display: true,
			                // beginAtZero: true,
			                autoSkip: false,
	                		// stepSize: 1,
	                		// min: 0,
	                		
	                		maxRotation: 90,
	                		minRotation: 90,
			                callback: function(value, index, values){
			                	return value.split(" ").join("\n");
			                }
			            	},
			            	stacked: this.stack

			        	}]
			    	}
			};

	}
	//dependiendo si es desktop o web (wORd contiene esa informacion) va a cargar los datos en arrayPatients
	public chartClickedCombined(e:any,wORd:any){
		//reinicio arrrayPatients
		this.arrayPatients = []
		/*
		* me aseguro que el click haya sido en el grafico y no en el fondo
		* para eso me fijo que existan los arreglos, estos no se generan 
		* si el click es en el fondo
		*/
		if (e.active != {} && e.active.length > 0){
			//seteo si es turnos atendidos o no
			this.nameButton=e.active[0]._model.label;
			this.nameButton=(e.active[0]._index == 0?STATE_TURN_WORD.ATTENDED:STATE_TURN_WORD.NOT_ATTENDED);
			
			if(e.active[0]._index == 0) //atendidos
				for (var i = 0; i < this.newTurnsFilter.length; ++i) {
					if (this.newTurnsFilter[i].campo5.trim().toUpperCase() == STATE_TURN_LETTER.ATTENDED.trim().toUpperCase()
						&& this.newTurnsFilter[i].subTema.trim() == wORd.trim())
						this.arrayPatients.push(this.newTurnsFilter[i]);
				}
			else//no atendidos
				for (var i = 0; i < this.newTurnsFilter.length; ++i) {
					if (this.newTurnsFilter[i].campo5.trim().toUpperCase() != STATE_TURN_LETTER.ATTENDED.trim().toUpperCase()
						&& this.newTurnsFilter[i].subTema.trim() == wORd.trim())
						this.arrayPatients.push(this.newTurnsFilter[i]);
				}
			//ejecuto el boton para que abra el modal
			document.getElementById("btnInfo").click();
		}
		else //en caso de hacer click en algun otro lado seteo el nombre como "ninguno"
			this.nameButton = COMMON_WORDS.ANYBODY;
		console.log(e);
	}

	// events
	//dependiendo en que tipo de grafico este parado el usuario van a ser los datos que cargue en arrayPatients
	public chartClicked(e:any):void {
		this.arrayPatients = []
		if (e.active != {} && e.active.length > 0){
			this.nameButton=e.active[0]._model.label;
			
			if (this.isDelay())
				for (var i = 0; i < this.arraySol.length; ++i) {
					if (this.arraySol[i].campo1.trim().toUpperCase() == this.nameButton.trim().toUpperCase())
						this.arrayPatients.push(this.arraySol[i]);
				}
			else if (this.isWebVsDesktop()){
				for (var i = 0; i < this.turnsCompleteds.length; ++i) {
					if (this.turnsCompleteds[i].campo1.trim().toUpperCase() == this.nameButton.trim().toUpperCase())
						this.arrayPatients.push(this.turnsCompleteds[i]);
				}
			}
			else
				{	
					if(e.active[0]._index == 0){
						this.nameButton = STATE_TURN_WORD.NOT_YET;
						for (var i = 0; i < this.newTurnsFilter.length; ++i) {
							if (this.newTurnsFilter[i].campo5.trim().toUpperCase() == STATE_TURN_LETTER.MISSING.trim().toUpperCase())
								this.arrayPatients.push(this.newTurnsFilter[i]);
						}
					}
					else if(e.active[0]._index == 1){
						this.nameButton = STATE_TURN_WORD.ATTENDED;
						for (var i = 0; i < this.newTurnsFilter.length; ++i) {
							if (this.newTurnsFilter[i].campo5.trim().toUpperCase() == STATE_TURN_LETTER.ATTENDED.trim().toUpperCase())
								this.arrayPatients.push(this.newTurnsFilter[i]);
						}
					}
					else if(e.active[0]._index == 2){
						this.nameButton = STATE_TURN_WORD.WAITING;
						for (var i = 0; i < this.newTurnsFilter.length; ++i) {
							if (this.newTurnsFilter[i].campo5.trim().toUpperCase() == STATE_TURN_LETTER.WAITING.trim().toUpperCase())
								this.arrayPatients.push(this.newTurnsFilter[i]);
						}
					}
					else if(e.active[0]._index == 3){
						this.nameButton = STATE_TURN_WORD.F;
						for (var i = 0; i < this.newTurnsFilter.length; ++i) {
							if (this.newTurnsFilter[i].campo5.trim().toUpperCase() == STATE_TURN_LETTER.F.trim().toUpperCase())
								this.arrayPatients.push(this.newTurnsFilter[i]);
						}
					}
					else if(e.active[0]._index == 4)	{
						this.nameButton = STATE_TURN_WORD.FCA;
						for (var i = 0; i < this.newTurnsFilter.length; ++i) {
							if (this.newTurnsFilter[i].campo5.trim().toUpperCase() == STATE_TURN_LETTER.FCA.trim().toUpperCase())
								this.arrayPatients.push(this.newTurnsFilter[i]);
						}
					}
				}
				
				document.getElementById("btnInfo").click();
		}
		else
			this.nameButton = COMMON_WORDS.ANYBODY;
		console.log(e);
	}

	//opciones del grafico de torta 
	public pieChartOptions: any = {
        	
        	tooltips: {
            callbacks: {
                label: function(tooltipItem, data) {
                	return data.labels[tooltipItem.index] + data.datasets[0].data[tooltipItem.index]  + '%';
                    

                }
            }
        }
    };

    //abstraccion comun para la funcion getStatesOfTurns(array: turnosV0[])
    countInfo(	arraySubTema: string, 
  				indexAttended: number,
  				indexCombinedData: number
  			){
    	//cuenta la cantidad de atendidos y de estados de turnos
  		if (arraySubTema.toUpperCase() == SUBTOPIC.WEB.toUpperCase()){
			this.attendedWeb[indexAttended] = this.attendedWeb[indexAttended] + 1;
			this.combinedDataWeb[indexCombinedData] = this.combinedDataWeb[indexCombinedData] + 1;
		}
		else{
			this.attendedDesktop[indexAttended] = this.attendedDesktop[indexAttended] + 1;
			this.combinedDataDesktop[indexCombinedData] = this.combinedDataDesktop[indexCombinedData] + 1;
		}
  	}

  	getStatesOfTurns(array: turnosV0[]){
  		this.stateData = [];
  		//0: para  atendidos 1: para no atendidos
  		this.attendedDesktop = [0,0];
  		this.attendedWeb = [0,0];

  		//si se agregan categorias hay que ir sumandoles 0s a estos 2 arreglos
  		this.combinedDataDesktop = [0,0,0,0,0,0];
		this.combinedDataWeb = [0,0,0,0,0,0];

  		let aux: number[] = [0,0,0,0,0,0];
  		for (var i = 0; i < array.length; i++) {
  			if (array[i].campo5.trim() == STATE_TURN_LETTER.MISSING){
  				this.countInfo(array[i].subTema,1,0);
  				aux[0] = aux[0] + 1;
  			}
  			else if (array[i].campo5.trim() == STATE_TURN_LETTER.ATTENDED) {
  				this.countInfo(array[i].subTema,0,1);
  				aux[1] = aux[1] + 1;
  			}
  			else if (array[i].campo5.trim() == STATE_TURN_LETTER.WAITING){
  				this.countInfo(array[i].subTema,1,2);
  				aux[2] = aux[2] + 1;
  			}
  			else  if(array[i].campo5.trim() == STATE_TURN_LETTER.F){
  				this.countInfo(array[i].subTema,1,3);
  				aux[3] = aux[3] + 1;
  			}
  			else if(array[i].campo5.trim() == STATE_TURN_LETTER.FCA){
  				this.countInfo(array[i].subTema,1,4);
  				aux[4] = aux[4] + 1;
  			}
  			else if (array[i].campo5.trim() == STATE_TURN_LETTER.C){
  				this.countInfo(array[i].subTema,1,5);
  				aux[5] = aux[5] + 1;
  			}
  			else 
  				console.log(array[i]);
  		}

  		let totalAttDes = this.attendedDesktop[0] + this.attendedDesktop[1];
  		let totalAttWeb = this.attendedWeb[0] + this.attendedWeb[1];
  		//los pasa a porcentaje
  		this.attendedDesktop[0] = ( this.attendedDesktop[0] * 100 / totalAttDes ).toFixed(2);
  		this.attendedDesktop[1] = ( this.attendedDesktop[1] * 100 / totalAttDes ).toFixed(2);
  		this.attendedWeb[0] = ( this.attendedWeb[0] * 100 / totalAttWeb ).toFixed(2);
  		this.attendedWeb[1] = ( this.attendedWeb[1] * 100 / totalAttWeb ).toFixed(2);
  		//setea la auxiliar en el arreglo de ldatos del grafico
  		this.stateData = aux;
  	}


	//funcion y variable para el cambio de tamaño en Estadisticas de estado de turnos (Web vs Escritorio)
	
	changeSizeBoolean(){
		this.nameButton = COMMON_WORDS.ANYBODY;
		this.sizeBoolean = !this.sizeBoolean;
	}


}//fin de la clase
