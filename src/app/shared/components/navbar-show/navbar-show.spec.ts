import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavbarShow } from './navbar-show';

describe('NavbarShow', () => {
  let component: NavbarShow;
  let fixture: ComponentFixture<NavbarShow>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavbarShow],
    }).compileComponents();

    fixture = TestBed.createComponent(NavbarShow);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
