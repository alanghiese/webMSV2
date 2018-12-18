import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UparrowComponent } from './uparrow.component';

describe('UparrowComponent', () => {
  let component: UparrowComponent;
  let fixture: ComponentFixture<UparrowComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UparrowComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UparrowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
