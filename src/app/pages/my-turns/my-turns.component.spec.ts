import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MyTurnsComponent } from './my-turns.component';

describe('MyTurnsComponent', () => {
  let component: MyTurnsComponent;
  let fixture: ComponentFixture<MyTurnsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MyTurnsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MyTurnsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
