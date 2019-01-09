import { Component, OnInit } from '@angular/core';
import { AppComponent } from '../../app.component';
import { STATE_TURN_LETTER, COMMON_WORDS, STATE_TURN_WORD } from '../../constants';

//para las fechas
import { I18n, CustomDatepickerI18n } from '../../providers/CustomDatepickerI18n';
//import { NgbDateCustomParserFormatter } from '../../providers/NgbDateCustomParserFormatter';
import { NgbDatepickerI18n, NgbDateStruct, NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';



//fecha actual
const now = new Date();

@Component({
  selector: 'filters',
  templateUrl: './filters.component.html',
  styleUrls: ['./filters.component.css'],
  providers: [
  			I18n, 
  			{provide: NgbDatepickerI18n, useClass: CustomDatepickerI18n}/*, 
  			{provide: NgbDateParserFormatter, useClass: NgbDateCustomParserFormatter},*/
  			]
})

export class FiltersComponent implements OnInit {

	//para los models de los data pickers 
	modelSince: NgbDateStruct = {day: 1, month: now.getMonth() + 1, year: now.getFullYear() };
	modelUntil: NgbDateStruct= {day: this.lastday(now.getFullYear(),now.getMonth()), month: now.getMonth() + 1, year: now.getFullYear() };

	//arreglos para guardar los datos que luego muestro en los filtros
	public doctors:any = null;
	public services:any = null;
	public coverages:any = null;

	constructor(
				public appComponent: AppComponent
				){ 

		//seteo las fechas de ser necesario
		if (this.appComponent.filter.selUntil != COMMON_WORDS.EMPTY_CHAR){
			let d: Date = this.convertToDate(this.appComponent.filter.selUntil);
			this.modelUntil = {day: d.getDate(), month: d.getMonth()+1, year: d.getFullYear() };
		}

		if (this.appComponent.filter.selSince != COMMON_WORDS.EMPTY_CHAR){
			let d: Date = this.convertToDate(this.appComponent.filter.selSince);
			this.modelSince = {day: d.getDate(), month: d.getMonth()+1, year: d.getFullYear() };
		}
	  	this.appComponent.filter.selUntil = this.modelUntil.year + '-' + this.modelUntil.month + '-' + this.modelUntil.day;
	  	this.appComponent.filter.selSince = this.modelSince.year + '-' + this.modelSince.month + '-' + this.modelSince.day;
  	}

  	//devuelve el ultimo dia del mes
  	lastday (y,m){
		return  new Date(y, m +1, 0).getDate();
	}

	ngOnInit() {
		this.doctors = this.appComponent.getDoctors();
		this.services = this.appComponent.getServices();
		this.coverages = this.appComponent.getCoverages();

		//si ya no lo estan, inicializo los arreglos, es una medida de seguridad por si fallo lo de arriba
		if (!this.coverages)
			this.coverages = [];
		if (!this.doctors)
			this.doctors = [];
		if (!this.services)
			this.services = [];

		//seteo los valores del filtro (los que faltan estan seteados por HTML)
		if (this.appComponent.filter.excludeSurname != COMMON_WORDS.EMPTY_CHAR)
			document.getElementById('excludeSurname').innerText = this.appComponent.filter.excludeSurname;

		if (this.appComponent.filter.foundSurname != COMMON_WORDS.EMPTY_CHAR)
			document.getElementById('foundSurname').innerText = this.appComponent.filter.foundSurname;
		
		
	}



	//funcion que indica si mostrar el estado de turno o no, se setea en appcomponent desde fuera de los filtros
	showState():boolean{
      return this.appComponent.stateFilter;
    }

    //verifica si la fechas estan correctas since>=until
    validDate():boolean{

  		if (this.modelSince.year == this.modelUntil.year){
  			if (this.modelSince.month == this.modelUntil.month){
  				if (this.modelSince.day == this.modelUntil.day)
  					return true;
  				else return this.modelSince.day < this.modelUntil.day;
  			}
  			else return this.modelSince.month < this.modelUntil.month;

  		}
  		else return this.modelSince.year < this.modelUntil.year;
	}

	//Registro de cambios en filtro para:
	//Hasta
	onChangeUntil(value: Date) {
		this.appComponent.filter.selUntil = this.modelUntil.year + '-' + this.modelUntil.month + '-' + this.modelUntil.day;

	}


	//Desde
	onChangeSince(value: any) {
		this.appComponent.filter.selSince = this.modelSince.year + '-' + this.modelSince.month + '-' + this.modelSince.day;
	}

	//Servicio
	onChangeService(value: any) {
		if (value==COMMON_WORDS.ANY)
			this.appComponent.filter.selService = COMMON_WORDS.EMPTY_CHAR;
		else
			this.appComponent.filter.selService = value;
	}

	//Practice
	onChangeState(value: any) {
		if (value == STATE_TURN_WORD.ALL)
			this.appComponent.filter.selState = STATE_TURN_LETTER.ALL;
		else if (value == STATE_TURN_WORD.MISSING)
	      this.appComponent.filter.selState = STATE_TURN_LETTER.MISSING;
	    else if (value == STATE_TURN_WORD.ATTENDED)
	      this.appComponent.filter.selState = STATE_TURN_LETTER.ATTENDED;
	    else if (value == STATE_TURN_WORD.WAITING)
	      this.appComponent.filter.selState = STATE_TURN_LETTER.WAITING;
	    else if (value == STATE_TURN_WORD.F)
	      this.appComponent.filter.selState = STATE_TURN_LETTER.F;
	    else  if (value == STATE_TURN_WORD.FCA)
	      this.appComponent.filter.selState = STATE_TURN_LETTER.FCA;
	    else
	      this.appComponent.filter.selState = STATE_TURN_LETTER.C;
	}


	//Cobertura
	onChangeCoverage(value: any) {
		if (value==COMMON_WORDS.ANY)
			this.appComponent.filter.selCoverage = COMMON_WORDS.EMPTY_CHAR;
		else
			this.appComponent.filter.selCoverage = value;
	}


	//Doctor
	onChangeDoctor(value: any) {
		if (value==COMMON_WORDS.ANY)
			this.appComponent.filter.selDoctor = COMMON_WORDS.EMPTY_CHAR;
		else
			this.appComponent.filter.selDoctor = value;
	}


	//convierte de una fecha string a un Date
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

}
