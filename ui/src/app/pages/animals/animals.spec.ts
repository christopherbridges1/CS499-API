// Test file for Animals component
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Animals } from './animals';

// Unit tests for Animals component
describe('Animals', () => {
  let component: Animals;
  let fixture: ComponentFixture<Animals>;

  // Setup before each test
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Animals]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Animals);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  // Test to check if the component is created successfully
  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
