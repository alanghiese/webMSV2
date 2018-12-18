import { Component, OnInit } from '@angular/core';
import { AppComponent } from '../../app.component';
import { Router } from '@angular/router';
import { arrayManipulations } from '../../models/arrayManipulations';
import { localStorageModifications } from '../../models/localStorageFx';
import { PAGES, BOOLEAN_VAL, ERRORS, STATE_TURN_LETTER, COMMON_WORDS } from '../../constants';
import {NgbModal, ModalDismissReasons} from '@ng-bootstrap/ng-bootstrap';
import { turnosV0, regStatistics } from '../../interfaces';
import { DbPetitionsService } from '../../providers/db-petitions.service';
 




@Component({
  selector: 'real-time',
  templateUrl: './real-time.component.html',
  styleUrls: ['./real-time.component.css'],
  providers: [ DbPetitionsService ]
})
export class RealTimeComponent implements OnInit {

	private turnsReady: boolean = false;
	private arrayManipulationsOBJ: arrayManipulations;
	private turnsCompleteds: turnosV0[] = []; //turnos sacados del servicio
	private delaysDoctors: regStatistics[] = []; //delays de los doctores
	private totalTurns: number = 0; //cantidad de turnos cargado
	private timeToRefresh: number = 5000 * 60; //tiempo de recarga (5 segundos)
  public stateData:number[] = []; // para hacer el grafico de estados
  /*
  * esta variable marca la ultima actualizacion (llamada a refresh())
  */
  private lastUpdate = COMMON_WORDS.EMPTY_CHAR; 

  /*
  * estas dos variables sirven para evitar la llamada innecesaria al servicio
  */
  private backSince = null;
  private backUntil = null;
  private arraySol: turnosV0[] = []; //aca cargo los turnos filtrados
  private stack: boolean = false; // sirve para juntar/separar las barras de los graficos 
  private arrayPatients: turnosV0[] = []; ////array para los graficos
  private nameButton = COMMON_WORDS.ANYBODY;  // setea el nombre del boton para expandir informacion



	constructor(
              private router: Router,
              private appComponent: AppComponent,
              private dbPetitions: DbPetitionsService,
              private modalService: NgbModal
              ){}


	ngOnInit() {
    this.arrayManipulationsOBJ = new arrayManipulations();
    // limpio el intervalo global
	  clearInterval(this.appComponent.interval);
    localStorageModifications.cleanURL();
  	if (!localStorageModifications.getLogged()){
  		localStorageModifications.changeURL(PAGES.REAL_TIME);
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
     
    	this.appComponent.interval = setInterval(() => this.refresh(), this.timeToRefresh);
 	}

   //carga todo
   loadAll(){
     console.log('cargar turnos');

          let from = this.convertToDate(this.appComponent.filter.selSince);
          let to = this.convertToDate(this.appComponent.filter.selUntil);
          from.setHours(0);
          from.setMilliseconds(0);
          from.setMinutes(0);
          to.setHours(0);
          to.setMilliseconds(0);
          to.setMinutes(0);

            this.dbPetitions.getActualStatistics().subscribe((resp)=>{
            // this.dbPetitions.getStatic().subscribe((resp)=>{ //sacar si uso la peticion en tiempo real
            if (resp){
              this.arrayManipulationsOBJ.prepareArray(resp);
              this.turnsCompleteds = this.arrayManipulationsOBJ.getTurnsCompleteds();
              this.arrayManipulationsOBJ.prepareArrayDoctors(this.turnsCompleteds);
              this.arrayManipulationsOBJ.doctorsAverage(this.turnsCompleteds);
              this.delaysDoctors = this.arrayManipulationsOBJ.getDelays();
              this.filterFunction();


              this.turnsReady = true;
            }
            },
            (err)=>{
        let msg = ERRORS.UPS;
        if (err.message.includes(ERRORS.SESSION_EXPIRED)){
          msg = ERRORS.NEED_RELOG;
          localStorageModifications.changeLogged(BOOLEAN_VAL.FALSE);
          localStorageModifications.changeURL(PAGES.REAL_TIME);
          this.router.navigate([PAGES.LOGIN]);
        }
              

                alert(msg);
          });
   }


 	//devuelve la cantidad de turnos cargados
 	getTotalTurns(){
    	return this.totalTurns;
  	}

  	//abre el modal del parametro
  	open(content) {
		this.modalService.open(content);
	}

	setTime(value){
	    let int = parseInt(value) * 1000 * 60;
	  	this.timeToRefresh = int;
	    clearInterval(this.appComponent.interval);
	    this.appComponent.interval = setInterval(() => this.refresh(), this.timeToRefresh);
  	}

	//turnos cargados
	isReady():boolean{
  	return this.turnsReady;
	}


  //funciona igual que el de grpahs con la diferencia que este solo cuenta los estados nomas
  getStatesOfTurns(array: turnosV0[]){
      this.stateData = [];

    let aux: number[] = [0,0,0,0,0,0];
    for (var i = 0; i < array.length; i++) {
      if (array[i].campo5.trim() == STATE_TURN_LETTER.MISSING){
        let now = new Date();
        let campo2 = array[i].campo2;
        let campo2Date= new Date();
        campo2Date.setHours(parseInt(campo2.substr(0,3)),parseInt(campo2.substr(4,6)));
        // console.log(campo2);
        // console.log('campo2 ' + campo2Date.getHours());
        if (now<campo2Date)
          aux[0] = aux[0] + 1;
        else
          aux[5] = aux[5] + 1;
    }
      else if (array[i].campo5.trim() == STATE_TURN_LETTER.ATTENDED) 
        aux[1] = aux[1] + 1;
      else if (array[i].campo5.trim() == STATE_TURN_LETTER.WAITING)
        aux[2] = aux[2] + 1;
      else  if(array[i].campo5.trim() == STATE_TURN_LETTER.F)
        aux[3] = aux[3] + 1;
      else if(array[i].campo5.trim() == STATE_TURN_LETTER.FCA)
        aux[4] = aux[4] + 1;
      else 
        console.log(array[i]);
    }
    this.stateData = aux;
  }

   refresh(){
    this.turnsCompleteds = [];
    this.delaysDoctors = [];
    this.turnsReady = false;
    this.dbPetitions.getActualStatistics(
    ).subscribe((resp)=>{
          if (resp){
            this.arrayManipulationsOBJ.prepareArray(resp);
            this.turnsCompleteds = this.arrayManipulationsOBJ.getTurnsCompleteds();
            this.delaysDoctors = this.arrayManipulationsOBJ.getDelays();
          

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
            localStorageModifications.changeURL(PAGES.REAL_TIME);
            this.router.navigate([PAGES.LOGIN]);
          }
          });
    let now = new Date();
    this.lastUpdate ='Ultima actualizacion a las: ' + now.getHours() + ':' 
                      + now.getMinutes() + ':' + now.getSeconds();
    console.log(this.lastUpdate);
  }

  filterFunction(){
    //FILTROS
    //seteo la cantidad de turnos
    this.totalTurns = this.turnsCompleteds.length;
    //reinicio el array de turnos
    this.arraySol = [];
    //filtro los turnos que no tienen horarios seteados
    let arraySolOnlyOlds =  this.filterNewTurns(this.turnsCompleteds);
    //filtro los turnos con el filter y seteo los arreglos
    this.arraySol = this.appComponent.filter.filter(arraySolOnlyOlds);
    this.arrayManipulationsOBJ.prepareArrayDoctors(this.arraySol);
    this.arrayManipulationsOBJ.doctorsAverage(this.arraySol);
    this.delaysDoctors = this.arrayManipulationsOBJ.getDelays();     
    this.prepareGraphicDelay(this.delaysDoctors);

    //seteo el arreglo filtrado pero esta vez incluyo las tuplas sin horarios
    let SolutionWithAllStates = this.appComponent.filter.filter(this.turnsCompleteds);
    //obtengo y seteo los estados de turnos
    this.getStatesOfTurns(SolutionWithAllStates);
  }

  //contains de toda la vida
  contains(array: regStatistics[], valueToCompare: regStatistics){
    for (var i = 0; i < array.length; i++) {
      if (array[i].name.toUpperCase() == valueToCompare.name.toUpperCase())
        return true;
    }
    return false;
  }

  //filtra los turnos sin los horarios seteados
  filterNewTurns(array: turnosV0[]): turnosV0[]{
    let arr: turnosV0[] = [];
    for (var i = 0; i < array.length; i++) {
      if(array[i].campo3 != '' && array[i].campo4 != '')
        arr.push(array[i]);
    }
    return arr;
    
  }

  //para graficos de demora de medicos

  //configuraciones generales para cualquier grafico
  public barChartType:string = 'bar';
  public barChartLegend:boolean = true;

  //variables para los graficos
  public nameOfTheDoctors:string[] = [];
  public datasOfTheDoctors:any[] = [];
  //para grafico de turnos medico a medico
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
                    autoSkip: false,
                    
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
                          callback: function(value, index, values) {
                              return value + ' minutos';
                          }
                  }
              }],
                xAxes: [{
                  ticks: {
                      display: true,
                      autoSkip: false,
                      
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

    // events
  public chartClicked(e:any):void {
    this.arrayPatients = []
    if (e.active != {}){
      this.nameButton=e.active[0]._model.label;
      
        for (var i = 0; i < this.arraySol.length; ++i) {
          if (this.arraySol[i].campo1.trim().toUpperCase() == this.nameButton.trim().toUpperCase())
            this.arrayPatients.push(this.arraySol[i]);
        
        }
        
        document.getElementById("expand").click();
    }
    else
      this.nameButton = COMMON_WORDS.ANYBODY;
    console.log(e);
  }

  public chartHovered(e:any):void {
    console.log(e);
  }


  //limpia los arreglos de los graficos
  clearCharts() {
    while (this.nameOfTheDoctors.length > 0)
      this.nameOfTheDoctors.pop();
      this.datasOfTheDoctors= [
        {data: [], label: 'label1'},
        {data: [], label: 'label2'}
        ];
   }


  //carga los arreglos de delay
  prepareGraphicDelay(array: regStatistics[]){
    this.clearCharts();
    let auxAVGDoctors = [];
    let auxAVGPatients = [];

    for (var i = 0; i < array.length; i++) {
      if (array[i].avgDoctor != 0 || array[i].avgPatient != 0){
        this.nameOfTheDoctors.push(array[i].name);
        auxAVGDoctors.push(array[i].avgDoctor);
        auxAVGPatients.push(array[i].avgPatient);
      }
      
    }
    
    this.datasOfTheDoctors = [
            {data: auxAVGDoctors , label: 'Demora de doctores (en minutos)'},
            {data: auxAVGPatients , label: 'Demora de pacientes (en minutos)'}
            ];
  }

  //convierte de un string con el formato YYYY-MM-DD a un objeto tipo Date
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




}//fin de la clase
