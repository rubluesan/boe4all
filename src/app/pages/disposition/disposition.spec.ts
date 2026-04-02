import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Disposition } from './disposition';

describe('Disposition', () => {
  let component: Disposition;
  let fixture: ComponentFixture<Disposition>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Disposition],
    }).compileComponents();

    fixture = TestBed.createComponent(Disposition);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
