import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppComponent } from '../../app.component';
import { PAGES } from '../../constants';
import { localStorageModifications } from '../../models/localStorageFx';
import { DbPetitionsService } from '../../providers/db-petitions.service';


//CALENDARIO

import { colors } from '../../demo-utils/colors';
import { ChangeDetectionStrategy, ViewChild, TemplateRef } from '@angular/core';
import { startOfDay,  endOfDay, subDays, addDays, endOfMonth, isSameDay, isSameMonth, addHours } from 'date-fns';
import { Subject } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CalendarEvent, CalendarEventAction, CalendarEventTimesChangedEvent, CalendarView } from 'angular-calendar';



const now = new Date();

@Component({
	selector: 'my-turns',
	templateUrl: './my-turns.component.html',
	styleUrls: ['./my-turns.component.css'],
	providers: [ DbPetitionsService ]
})
export class MyTurnsComponent implements OnInit {

	public doctors:any = null;
	//doctor que actualmente esta seleccionado
	public currentDoctor = "";
	/*
	* para saber si estan cargados los turnos, 
	* como por defecto no hay turno es true inicialmente
	*/
	theOtherValue: boolean = true;
	//-999 es un valor por defecto para que la primera vez cargue si o si
	currentMonth: number = -999; 
	lowerRange: number = -1;
	higherRange: 1;

	

	constructor(	private router: Router,
					private appComponent: AppComponent,
					private _dbPetitions: DbPetitionsService,
					private modal: NgbModal
				) { 
		// this._dbPetitions.getDoctors("").subscribe((resp)=>{
		// 	console.log(resp);
		// })

	}

	ngOnInit() {
		clearInterval(this.appComponent.interval);
		localStorageModifications.cleanURL();
		if (!localStorageModifications.getLogged()){
			localStorageModifications.changeURL(PAGES.MY_TURNS)
			this.router.navigate([PAGES.LOGIN]);
		}
		else if (this.appComponent.needLoadArrays){
			localStorageModifications.changeURL(PAGES.MY_TURNS);
			this.appComponent.loginWithOutMoveToLoginPage().subscribe( (resp)=>{
				this.doctors = this.appComponent.getDoctors();

				//si lo de arriba falla inicializo el arreglo como vacio
				if (!this.doctors)
					this.doctors = [];
			});
		}
		else{
			this.doctors = this.appComponent.getDoctors();

			//si lo de arriba falla inicializo el arreglo como vacio
			if (!this.doctors)
				this.doctors = [];
		}

		
	}



	//devuelve true si los turnos ya estan cargados
	doctorsReady():boolean{
		return this.doctors != null && this.theOtherValue;
	}

	//devuelve el ultimo dia del mes
  	lastday (y,m){
		return  new Date(y, m +1, 0).getDate();
	}

	getTurns(){
		this.theOtherValue = false;
		this.events = [];
		//creo dos fechas que van a ser la de comienzo y final 
		let from: Date;
	    from = new Date();
	    from.setDate(1);
	    from.setHours(0);
	    from.setMinutes(0);
	    from.setSeconds(0);
	    from.setMilliseconds(0);

	    let to: Date;
	    to = new Date();
	    to.setDate(this.lastday(to.getFullYear(),to.getMonth()));
	    to.setHours(0);
	    to.setMinutes(0);
	    to.setSeconds(0);
	    to.setMilliseconds(0);
	    this.setMonthAndYear(from,this.lowerRange);
	    this.setMonthAndYear(to,this.higherRange);

	    let id;
	    let allDoctors = this.appComponent.getDoctors();
	    for (var k in allDoctors){
	    	if(allDoctors[k].nombre == this.currentDoctor)
	    		id = allDoctors[k].codigo;
	    }

		console.log("Obteniendo turnos..")
		this._dbPetitions.getTurnsDoctors(id, this.currentDoctor, from, to)
		.subscribe((turns)=>{
			if (turns){
				console.log("Turnos obtenidos!")
				// console.log(turns);
				for (var i in turns) {
					if (this.isObject(turns[i])){
						
						let date: Date = this.convertToDate(turns[i].dia, turns[i].hora);

						this.events.push({
							start: date,
							end: date,
							title: turns[i].apellido,
							color: colors.red,
							actions: this.actions,
							allDay: true,
							resizable: {
								beforeStart: true,
								afterEnd: true
							},
  							draggable: true
						})
					}


				}
				this.refresh.next();
				this.theOtherValue = true;
				// this.appComponent.events = [];
				// this.appComponent.events = this.events;
				// this.appComponent.emitConfig(this.events);
			}
		});
	}

	//comprueba si val es un objeto o un tipo primitivo
	isObject(val) {
    	return val instanceof Object; 
	}

	//setea el mes y año correcto de acuerdo a lo seleccionado por el usuario
	//difference sirve para el rango
	setMonthAndYear(date: Date, difference: number){
		let month;
		let year;
		/*
		 * auxMont es el mes actual +-difference
		 * con diffrenece ya dejo listo el mes para el rango que decida usar
		 */
		let auxMonth: number = this.currentMonth + difference;
		if (auxMonth < 0)
			/*
			 * si el mes es del año anterior le sumo 13 para llevarlo al valor que debe ser
			 * ejemplo: si es -2 => -2+13 = 11 (noviembre)
			 */
			month = auxMonth + 13; 
		else
			//si no lo dejo tal cual
			month = auxMonth;


		//si el mes es negativo entonces el año es anterior al actual
		if ( auxMonth < 0 )
			year = now.getFullYear() - Math.ceil(auxMonth/12) 
		//si el mes es superior a 11 (diciembre) el año es posterior al actual
		else if (auxMonth > 11 )
			year = now.getFullYear() + Math.ceil(auxMonth/12) 
		//si no es el año actual
		else
			year = now.getFullYear();
		date.setMonth(month);
		date.setFullYear(year);
	}

	//convierto de un string con formato YYYY-MM-DD a un Date
  	convertToDate(date:String, hours: String):Date{
		let d = new Date();
		//DD-MM-YYYY
		let second = date.lastIndexOf('-');
		let first = date.indexOf('-')
		let day = parseInt(date.substr(0,first));
		let month = parseInt(date.substr(first+1,second))-1;
		let year = parseInt(date.substr(second+1,date.length));


		d.setFullYear(year);
		d.setMonth(month);
		d.setDate(day);

		let dowbleDot = hours.indexOf(":");
		let hour = parseInt(hours.substr(0,dowbleDot));
		let minuts = parseInt(hours.substr(dowbleDot+1))
		d.setMilliseconds(0);
		d.setMinutes(minuts);
		d.setSeconds(0);
		d.setHours(hour);

		console.log(d);
		return d;
	}






//CALENDARIO-----------------------------------------------------------------------------
locale: string = 'es-AR';
events: CalendarEvent[] = [
    // {
    //   start: subDays(startOfDay(new Date()), 1),
    //   end: addDays(new Date(), 1),
    //   title: 'A 3 day event',
    //   color: colors.red,
    //   actions: this.actions,
    //   allDay: true,
    //   resizable: {
    //     beforeStart: true,
    //     afterEnd: true
    //   },
    //   draggable: true
    // },
    // {
    //   start: startOfDay(new Date()),
    //   title: 'An event with no end date',
    //   color: colors.yellow,
    //   actions: this.actions
    // },
    // {
    //   start: subDays(endOfMonth(new Date()), 3),
    //   end: addDays(endOfMonth(new Date()), 3),
    //   title: 'A long event that spans 2 months',
    //   color: colors.blue,
    //   allDay: true
    // },
    // {
    //   start: addHours(startOfDay(new Date()), 2),
    //   end: new Date(),
    //   title: 'A draggable and resizable event',
    //   color: colors.yellow,
    //   actions: this.actions,
    //   resizable: {
    //     beforeStart: true,
    //     afterEnd: true
    //   },
    //   draggable: true
    // }
  ];

	

  @ViewChild('modalContent')
  modalContent: TemplateRef<any>;

  view: CalendarView = CalendarView.Month;

  CalendarView = CalendarView;

  viewDate: Date = new Date();

  modalData: {
    action: string;
    event: CalendarEvent;
  };

  actions: CalendarEventAction[] = [
    {
      label: '<i class="fa fa-fw fa-pencil"></i>',
      onClick: ({ event }: { event: CalendarEvent }): void => {
        this.handleEvent('Edited', event);
      }
    },
    {
      label: '<i class="fa fa-fw fa-times"></i>',
      onClick: ({ event }: { event: CalendarEvent }): void => {
        this.events = this.events.filter(iEvent => iEvent !== event);
        this.handleEvent('Deleted', event);
      }
    }
  ];

  refresh: Subject<any> = new Subject();

  

  activeDayIsOpen: boolean = true;


  dayClicked({ date, events }: { date: Date; events: CalendarEvent[] }): void {
    if (isSameMonth(date, this.viewDate)) {
      this.viewDate = date;
      if (
        (isSameDay(this.viewDate, date) && this.activeDayIsOpen === true) ||
        events.length === 0
      ) {
        this.activeDayIsOpen = false;
      } else {
        this.activeDayIsOpen = true;
      }
    }
  }

  eventTimesChanged({
    event,
    newStart,
    newEnd
  }: CalendarEventTimesChangedEvent): void {
    event.start = newStart;
    event.end = newEnd;
    this.handleEvent('Dropped or resized', event);
    this.refresh.next();
  }

  handleEvent(action: string, event: CalendarEvent): void {
    this.modalData = { event, action };
    this.modal.open(this.modalContent, { size: 'lg' });
  }

  
//endOfDay(DATE) devuelve un Date al final del dia de DATE
//startOfDat(DATE) devuelve un Date al final del dia de DATE


addEvent(): void {
    let day: Date;
    day = new Date();
    day.setDate(24);
    this.events.push({
      title: 'Evento nuevo',
      start: startOfDay(new Date()),
      end: day,
      color: colors.red,
      draggable: true,
      // resizable: {
      //   beforeStart: true,
      //   afterEnd: true
      // }
    });
    this.refresh.next();
}


  //calendar header functions

updateTurns(month:number){
  	// solo hago este seteo cuando el mes ya fue iniciado
  	if ( this.currentMonth != -999 )
  		this.currentMonth = this.currentMonth + month;
  	/*
  	 * si es la primera vez o
  	 * si el mes al que trato de acceder esta fuera del mes actual +- 1 
  	 * y hay doctor seleccionado recargo los turnos
  	 */
  	if ( this.currentMonth == -999 ){ //esto es para el caso de la primera vez
  		//seteo el mes actual
  		this.currentMonth = now.getMonth()+month;
  		//obtengo los turnos solo si hay un medico seteado
  		if (this.currentDoctor != "")
  			this.getTurns();
  	}
  	else if (this.currentDoctor != "" && 
  	   ( this.currentMonth < now.getMonth()+ this.lowerRange || 
  	   	 this.currentMonth > now.getMonth()+ this.higherRange ) )
  		this.getTurns();
  }

}

