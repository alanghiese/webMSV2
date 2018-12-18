import { Component, OnInit } from '@angular/core';
import { AppComponent } from '../../app.component';


@Component({
  selector: 'contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css']
})
export class ContactComponent implements OnInit {

	constructor(private appComponent: AppComponent) {}

	ngOnInit() {
		//con esto elimino el intervalo que usa el componente de tiempo real
		clearInterval(this.appComponent.interval);
	}

}
