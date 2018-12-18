import { turnosV0, regStatistics, webVSdesktop } from '../interfaces';
import { MathsFunctions } from './mathsFunctions'


export class arrayManipulations{

	//todos los turnos
	private turnsCompleteds: turnosV0[] = [];
	//array con promedios y contadores
	private delays: regStatistics[] = [];
	private math: MathsFunctions = new MathsFunctions();

	constructor(){}

	/*
	* obtiene el size del arreglo y luego setea todos los valores del array del parametro en el 
	* array interno de la clase (devuelve el arreglo por si se necesita)
	*/
	prepareArray(array: turnosV0[]): turnosV0[]{
		//inicializo el arreglo
		this.turnsCompleteds = [];
		let intC;
		//cuento la cantidad de datos (no siempre es un array real lo que me pasan)
		if(!array.length){
			let c;
			for (var i in array) {
				if (parseInt(i))
					c = i;
			}
		intC = parseInt(c);
		}
		else //si era un array real directamente uso el tamaño del array
			intC = array.length;
		//paso todos los datos del parametro al array interno
		for (var k = 0; k < intC; k++) { 
			this.turnsCompleteds.push(array[k]);
		}
		return this.turnsCompleteds;
	}

	//carga los nombre de todos los doctores y ademas les setea todos los valores en 0
	prepareArrayDoctors(array:turnosV0[]){
		this.delays = [];
		let doctors: string[] = this.getDoctors(array);
		
		for (var i = 0; i < doctors.length; i++) {
			this.delays.push({name: doctors[i], avgDoctor: 0, avgPatient: 0, countWeb: 0, countDesktop: 0})
		}

	}

	//se fija si un doctor se encuentra en arreglo de doctores
	foundDoctor(doctor: string, doctors: string[]){
		for (var k = 0; k < doctors.length; k++) {
				if (doctor == doctors[k])
					return true;
			}
		return false;
	}

	getDoctors(array: turnosV0[]):string[]{
		let doctors: string[] = []; 
		//para cada medico del array voy a ir agregandolo al nuevo arreglo si aun no esta
		for (var i = 0; i < array.length; i++) {
			if (!this.foundDoctor(array[i].campo1, doctors))
				doctors.push(array[i].campo1);
			
		}
		return doctors;
	}

	doctorsAverage(fullTurns:turnosV0[]){
		//calculo promedios y cuento para cada doctor y lo pongo en el campo que le compete
		for (var i = 0; i < this.delays.length; i++) {
			this.delays[i].avgDoctor = this.math.avgDoctor(this.delays[i].name,fullTurns);
			this.delays[i].avgPatient = this.math.avgPatient(this.delays[i].name,fullTurns);
			this.delays[i].countWeb = this.math.countWebTurns(this.delays[i].name,fullTurns);
			this.delays[i].countDesktop = this.math.countDesktopTurns(this.delays[i].name,fullTurns);
		}
		//ordeno el arreglo por los nombres de los doctores
		this.delays.sort(
			function(a,b){
				if (b.name > a.name)
					return -1;
				else return 1;
			}
		);
	}


	//solo cuenta la cantidad de turnos web y de desktop
	onlyCountWebDesktopTurns(fullTurns: turnosV0[]){
		let arr: webVSdesktop[] = [];
		for (var i = 0; i < this.delays.length; i++) {
			arr.push({
				name: this.delays[i].name,
				web: this.math.countWebTurns(this.delays[i].name,fullTurns),
				desktop: this.math.countDesktopTurns(this.delays[i].name,fullTurns)
			})
		}
		arr.sort(
			function(a,b){
				if (b.name > a.name)
					return -1;
				else return 1;
			}
		); 
		return arr;
	}

	//devuelven los arreglos internos
	getTurnsCompleteds(): turnosV0[]{
		return this.turnsCompleteds;
	}

	getDelays(): regStatistics[]{
		return this.delays;
	}


}