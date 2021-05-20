import {Component} from "@angular/core";
import {TestBed} from "@angular/core/testing";
import {FnMethodPipe} from "../lib/fn-method.pipe";

@Component({
  template: `{{ referenceObject | fnMethod:methodName:$any(args) }}`
})
export class HostComponent {
  public referenceObject: any;
  public methodName: string;
  public args: unknown[];

  setExpression<T>(obj: T, method: keyof T & string, args: unknown[]) {
    this.referenceObject = obj;
    this.methodName = method;
    this.args = args;
  }
}

class TestClass {
  public returnThis(...args: unknown[]): TestClass {
    return this;
  }
}

describe('Pipe: fnMethod', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [HostComponent, FnMethodPipe]
    });
  });

  it('should call instance methods correctly', () => {
    const fixture = TestBed.createComponent(HostComponent);
    const instance = new TestClass();
    const spy = spyOn(instance, 'returnThis').and.callThrough();
    fixture.componentInstance.setExpression(instance, 'returnThis', [1, 2, "test"]);
    fixture.detectChanges();
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith(1, 2, "test");
    expect(spy.calls.first().returnValue).toEqual(instance);
  });
});
