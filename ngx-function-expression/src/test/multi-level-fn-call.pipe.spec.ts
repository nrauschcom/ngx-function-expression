import {ChangeDetectionStrategy, Component, Input, ViewChild} from "@angular/core";
import {TestBed} from "@angular/core/testing";
import {FnCallPipe} from "../lib/fn-call.pipe";
import {Observable, of} from "rxjs";

@Component({
  selector: 'test-component',
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TestComponent {
  static instance: TestComponent;

  constructor() {
    TestComponent.instance = this;
  }

  @Input()
  private testInput: unknown;

  getValue(): unknown {
    return this.testInput;
  }
}

@Component({
  template: '<test-component *ngIf="true" [testInput]="([thisUsingFunction, 8] | fnCall | async) + 3"></test-component>'
})
export class TestComponentWrapper {
  @ViewChild('comp')
  component: TestComponent;

  private internalValue = 5;

  thisUsingFunction(number: number): Observable<number> {
    expect(this).toBeInstanceOf(TestComponentWrapper);
    return of(this.internalValue + number);
  }
}

describe('Multi Level fnCall Pipe', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TestComponent, TestComponentWrapper, FnCallPipe]
    }).compileComponents();
  });

  it('should correctly infer the this argument', async () => {
    const fixture = TestBed.createComponent(TestComponentWrapper);
    fixture.detectChanges();
    expect(TestComponent.instance.getValue()).toBe(16);
  });
});
