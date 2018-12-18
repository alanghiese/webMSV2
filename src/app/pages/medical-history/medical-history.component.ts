import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppComponent } from '../../app.component';
import { PAGES } from '../../constants';
import { localStorageModifications } from '../../models/localStorageFx'

@Component({
  selector: 'medical-history',
  templateUrl: './medical-history.component.html',
  styleUrls: ['./medical-history.component.css']
})
export class MedicalHistoryComponent implements OnInit {

	  constructor(	private router: Router,
  					private appComponent: AppComponent) { }

	ngOnInit() {
		localStorageModifications.cleanURL();
		if (!localStorageModifications.getLogged()){
			localStorageModifications.changeURL(PAGES.MEDICAL_HISTORY);
      		this.router.navigate([PAGES.LOGIN]);
		}
		else if (this.appComponent.needLoadArrays){
			localStorageModifications.changeURL(PAGES.MEDICAL_HISTORY);
			this.appComponent.loginWithOutMoveToLoginPage();
		}
	}

	

}
