import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomSearcher } from './custom-searcher';

describe('CustomSearcher', () => {
  let component: CustomSearcher;
  let fixture: ComponentFixture<CustomSearcher>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomSearcher]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomSearcher);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
