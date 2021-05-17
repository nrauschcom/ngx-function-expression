import {ChangeDetectionStrategy, Component, Input} from "@angular/core";
import {TestBed} from "@angular/core/testing";
import {FnCallPipe} from "../lib/fn-call.pipe";
import {Observable, of} from "rxjs";

@Component({
  selector: 'test-input',
  template: ''
})
export class TestInputComponent {
  @Input()
  testInput: Observable<number>;
}

@Component({
  selector: 'test-component',
  template: `<test-input [testInput]="[fn, 1] | fnCall"></test-input>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TestComponent {
  static instance: TestComponent;
  public instance = this;

  constructor(fnCall: FnCallPipe) {
    TestComponent.instance = this;
  }

  fn(a: number, str: string): Observable<number> {
    return of(1);
  }
}

describe('Multi Level fnCall Pipe', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TestComponent, FnCallPipe]
    }).compileComponents();
  });

  it('should correctly infer the this argument', async () => {
    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
  });
});
