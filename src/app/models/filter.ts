import { turnosV0 } from '../interfaces';
import { STATE_TURN_LETTER, COMMON_WORDS } from '../constants';

export class Filter{
	
	constructor( //de esta manera no es necesario declarar las variables de forma interna, se hace automatico
			public excludeSurname: string,
			public foundSurname: string,
			public selUntil: string,
			public selSince: string,
			public selService: string,
			public selState: string,
			public selCoverage: string,
			public selDoctor: string
			) {}


	//filtra un arreglo del tipo turnosV0 pasando por los filtros comunes 
	filter(original:turnosV0[]):turnosV0[]{
		// let datesTurns: turnosV0[] = [];
		// this.filterDates(datesTurns,original);//esto esta aca para cuando uso el peticion estatica

		
  		let doctorsTurns: turnosV0[] = [];

		this.filterDoctors(doctorsTurns,original);

		let servicesTurns: turnosV0[] = [];
		this.filterService(servicesTurns,doctorsTurns);

		let coveragesTurns: turnosV0[] = [];
		this.filterCoverages(coveragesTurns,servicesTurns);

		let excludeSurnameTurns: turnosV0[] = [];
		this.excludeSurnameFx(excludeSurnameTurns,coveragesTurns);
		
		let includeSurnameTurns: turnosV0[] = [];
		this.includeSurname(includeSurnameTurns,excludeSurnameTurns);

		return includeSurnameTurns;
	}
	//como no siempre se usa el estado hay un filtro por separado que retorna el array filtrado por estado
	public filterState(full: turnosV0[]){
  		let array: any[] = [];
  		if (this.selState != STATE_TURN_LETTER.ALL){
			for (let k = 0; k < full.length ; k++) {
				if (full[k].campo5.trim().toUpperCase() == this.selState.trim().toUpperCase()){
					array.push(full[k]);
				}
			}
		}
		else {
			for (let k = 0; k < full.length ; k++) {
				array.push(full[k]);
			}
		}
		return array;
  	}

	private filterDoctors(array: turnosV0[], full: turnosV0[]){
  		//si no hay uno seleccionado lo copio enteramente
  		if (this.selDoctor != COMMON_WORDS.EMPTY_CHAR){
			for (let k = 0; k < full.length ; k++) {
				if (full[k].campo1.trim().toUpperCase() == this.selDoctor.trim().toUpperCase()){
					array.push(full[k]);
				}
			}
		}
		else {
			for (let k = 0; k < full.length ; k++) {
				array.push(full[k]);
			}
		}
  	}

  	private excludeSurnameFx(array: turnosV0[], full: turnosV0[]){
  		//si no hay uno seleccionado lo copio enteramente
  		if (this.excludeSurname != COMMON_WORDS.EMPTY_CHAR){
			for (let k = 0; k < full.length ; k++) {
				if (!full[k].nomUsuario.toUpperCase().includes(this.excludeSurname.toUpperCase())){
					array.push(full[k]);
				}
			}
		}
		else {
			for (let k = 0; k < full.length ; k++) {
				array.push(full[k]);
			}
		}
  	}

  	private includeSurname(array: turnosV0[], full: turnosV0[]){
  		//si no hay uno seleccionado lo copio enteramente
  		if (this.foundSurname != COMMON_WORDS.EMPTY_CHAR){
			for (let k = 0; k < full.length ; k++) {
				if (full[k].nomUsuario.toUpperCase().includes(this.foundSurname.toUpperCase())){
					array.push(full[k]);
				}
			}
		}
		else {
			for (let k = 0; k < full.length ; k++) {
				array.push(full[k]);
			}
		}
  	}

  	private filterService(array: turnosV0[], full: turnosV0[]){
  		
  		//si no hay uno seleccionado lo copio enteramente
  		if (this.selService != COMMON_WORDS.EMPTY_CHAR){
			for (let k = 0; k < full.length ; k++) {
				// console.log(full[k].campo7)
				if (full[k].campo7.toUpperCase() == this.selService.toUpperCase())
					array.push(full[k]);
			}
		}
		else {
			for (let k = 0; k < full.length ; k++) {
				array.push(full[k]);
			}
		}
  	}

  	private filterCoverages(array: turnosV0[], full: turnosV0[]){
  		//aca hay tres opciones, filtrar por uno en particular, por NO_COVERAGE o sin alguno seleccionado
  		let noCoverage = COMMON_WORDS.NO_COVERAGE;
  		if (this.selCoverage == noCoverage){
			for (let k = 0; k < full.length ; k++) {
				if (full[k].campo6.toUpperCase() == "")
					array.push(full[k]);
			}
		}
  		
		else if (this.selCoverage != COMMON_WORDS.EMPTY_CHAR){
			for (let k = 0; k < full.length ; k++) {
				if (full[k].campo6.toUpperCase() == this.selCoverage.toUpperCase())
					array.push(full[k]);
			}
		}	
		else {
			for (let k = 0; k < full.length ; k++) {
				array.push(full[k]);
			}

		}

  	}
  	//esta funcion queda declarada por si uso el servicio estatico pero si no no se usa
  	private filterDates(array,arrayToCompare:turnosV0[]){
		let since = this.convertToDate(this.selSince);
		let until = this.convertToDate(this.selUntil);
		
		since.setHours(0);
		since.setMilliseconds(0);
		since.setMinutes(0);
		since.setSeconds(0);
		until.setHours(23,59,59);

		for (let k = 0; k < arrayToCompare.length ; k++) {
			
			let date = new Date(arrayToCompare[k].fecha1);
			if (date >= since && date <= until)
				array.push(arrayToCompare[k]);
		}
	}
	//convierte de un string a un Date
	private convertToDate(date:String):Date{
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