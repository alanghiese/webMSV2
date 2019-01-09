import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppComponent } from '../../app.component';
import { PAGES } from '../../constants';
import { localStorageModifications } from '../../models/localStorageFx'



import {NgbDateStruct, NgbCalendar} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'my-turns',
  templateUrl: './my-turns.component.html',
  styleUrls: ['./my-turns.component.css']
})
export class MyTurnsComponent implements OnInit {

	public doctors:any = null;

	//para el datepicker
	model: NgbDateStruct;
  	date: {year: number, month: number};

	constructor(	private router: Router,
					private appComponent: AppComponent,
					private calendar: NgbCalendar
				) { }

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

	
	doctorsReady():boolean{
		return this.doctors != null;
	}

}
