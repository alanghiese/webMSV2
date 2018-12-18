import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppComponent } from '../../app.component';
import { PAGES , BOOLEAN_VAL} from '../../constants';
import { localStorageModifications } from '../../models/localStorageFx'

@Component({
  selector: 'my-turns',
  templateUrl: './my-turns.component.html',
  styleUrls: ['./my-turns.component.css']
})
export class MyTurnsComponent implements OnInit {

	constructor(	private router: Router,
					private appComponent: AppComponent) { }

	ngOnInit() {
		clearInterval(this.appComponent.interval);
		localStorageModifications.cleanURL();
		if (!localStorageModifications.getLogged()){
			localStorageModifications.changeURL(PAGES.MY_TURNS)
			this.router.navigate([PAGES.LOGIN]);
		}
		else if (this.appComponent.needLoadArrays){
			localStorageModifications.changeURL(PAGES.MY_TURNS);
			this.appComponent.loginWithOutMoveToLoginPage();
		}
	}

	

}
