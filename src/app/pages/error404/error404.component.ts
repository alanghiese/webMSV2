import { Component, OnInit } from '@angular/core';
import { AppComponent } from '../../app.component';

@Component({
  selector: 'error404',
  templateUrl: './error404.component.html',
  styleUrls: ['./error404.component.css']
})
export class Error404Component implements OnInit {

  constructor(private appComponent: AppComponent) { }

  ngOnInit() {
  	    clearInterval(this.appComponent.interval);

  }

}
