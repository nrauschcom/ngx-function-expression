import {Component, Input, ViewChild} from "@angular/core";
import {FunctionExpression} from "../lib/fn-function-expression.type";
import {TestBed} from "@angular/core/testing";
import {FnCallPipe} from "../lib/fn-call.pipe";

@Component({
  selector: 'test-component',
  template: ''
})
export class TestComponent {
  @Input()
  private testInput: unknown;

  getValue(): unknown {
    return this.testInput;
  }
}

@Component({
  template: '<test-component #comp [testInput]="[thisUsingFunction, 8] | fnCall"></test-component>'
})
export class TestComponentWrapper {
  @ViewChild('comp')
  component: TestComponent;

  activeFunctionExpression: FunctionExpression<any> = null;
  private internalValue = 5;

  thisUsingFunction(number: number) {
    return this.internalValue + number;
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
    expect(fixture.componentInstance.component.getValue()).toBe(13);
  });
});
