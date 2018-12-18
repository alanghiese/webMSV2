import { Component, OnInit } from '@angular/core';
import { AppComponent } from '../../app.component';
import { Router } from '@angular/router';
import { PAGES, BOOLEAN_VAL } from '../../constants';
import { localStorageModifications } from '../../models/localStorageFx' 

@Component({
  selector: 'empty',
  templateUrl: './empty.component.html',
  styleUrls: ['./empty.component.css']
})
export class EmptyComponent implements OnInit {

	constructor(
				private router: Router,
				private appComponent: AppComponent) { }

	ngOnInit() {
		//limpio el intervalo
		clearInterval(this.appComponent.interval);
		localStorageModifications.cleanURL();
		if (!localStorageModifications.getLogged()){
			localStorageModifications.changeURL(PAGES.HOME);
      		this.router.navigate([PAGES.LOGIN]);

		}
		else if (this.appComponent.needLoadArrays){
			localStorageModifications.changeURL(PAGES.HOME);
			this.appComponent.loginWithOutMoveToLoginPage();
		}
	}

	

}
