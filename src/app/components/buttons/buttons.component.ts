import { Component, OnInit } from '@angular/core';
import { AppComponent } from '../../app.component';

@Component({
  selector: 'buttons',
  templateUrl: './buttons.component.html',
  styleUrls: ['./buttons.component.css']
})
export class ButtonsComponent implements OnInit {

  constructor(private appComponent: AppComponent) {}


  ngOnInit() {
  }

  //esta funcion setea el valor del appComponent "now" que sirve para que en el componente de tiempo real no muestre ciertos filtros
  onChange(value){
  	if (value=='1')
  		this.appComponent.now = true;
  	else
  		this.appComponent.now = false;

  }

}

