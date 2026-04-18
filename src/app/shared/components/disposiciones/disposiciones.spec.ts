import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Disposiciones } from './disposiciones';

describe('Disposiciones', () => {
  let component: Disposiciones;
  let fixture: ComponentFixture<Disposiciones>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Disposiciones]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Disposiciones);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
