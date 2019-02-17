import { Component, OnInit } from '@angular/core';
import { AppComponent } from '../../app.component';
import { DbPetitionsService } from '../../providers/db-petitions.service';
import { DESTINATION_DATA, COMMON_WORDS, MESSAGES } from '../../constants'


@Component({
  selector: 'contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css'],
  providers: [ DbPetitionsService ]
})
export class ContactComponent implements OnInit {

	constructor(
				private appComponent: AppComponent,
				private _dbPetirions: DbPetitionsService
				){}

	ngOnInit() {
		//con esto elimino el intervalo que usa el componente de tiempo real
		clearInterval(this.appComponent.interval);
	}

	name: string;
	email: string;
	message: string;
	chkSendMe = false;

	processForm() {
    //envio el email a medisoftware
    this._dbPetirions.sendEmail(this.email,this.name,this.message).subscribe(
    	(resp)=>{
    		if (resp.msg.includes(COMMON_WORDS.RECORDED)){
    			alert(MESSAGES.MESSAGE_SENT);
				// document.getElementById('name').innerText = "";
				// document.getElementById('email').innerText = "";
				// document.getElementById('message').innerText = "";
    // 			this.name="";
    // 			this.email="";
    // 			this.message="";
    // 			this.chkSendMe=false; 
    		}
    	}

    );
    //si el usuario marco para que se le envie una copia tambien lo hago
    if (this.chkSendMe)
    	this._dbPetirions.sendEmailTo(DESTINATION_DATA.EMAIL, 
    								DESTINATION_DATA.NAME,
    								this.message,
    								this.email,
    								this.name)	;
  }


  
}
