import {Component} from "@angular/core";
import {fakeAsync, TestBed} from "@angular/core/testing";
import {FnApplyPipe} from "../lib/fn-apply.pipe";
import {FnApplyAsyncPipe} from "../lib/fn-async-apply.pipe";
import {
  FunctionParameters,
  ObservableParameters,
  ParametrizedFunction,
  UnparametrizedFunction
} from "../lib/utility-types";
import {BehaviorSubject, Observable, of} from "rxjs";

@Component({
  template: '{{ function() }}'
})
export class TrivialHostComponent {
  function: UnparametrizedFunction;

  setExpression<F extends UnparametrizedFunction>(fn: UnparametrizedFunction) {
    this.function = fn;
  }
}

@Component({
  template: '{{function | fnApply:$any(args):thisArg}}'
})
export class TestHostComponent {
  function: ParametrizedFunction;
  args: FunctionParameters<any>;
  thisArg: unknown;

  setExpression<F extends ParametrizedFunction>(fn: F, args: FunctionParameters<F>, thisArg: any = undefined) {
    this.function = fn;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    this.args = args;
    this.thisArg = thisArg;
  }
}

@Component({
  template: '{{function | fnApplyAsync:$any(args):thisArg}}'
})
export class AsyncTestHostComponent {
  function: ParametrizedFunction;
  args: Observable<unknown>[];
  thisArg: unknown;

  setExpression<F extends ParametrizedFunction>(fn: F, args: ObservableParameters<F>, thisArg: any = undefined) {
    this.function = fn;
    this.args = args;
    this.thisArg = thisArg;
  }
}


@Component({
  template: '{{componentMethod | fnApply}}'
})
export class SimpleTestHostComponent {
  private member = 24;

  componentMethod() {
    return this.member;
  }
}

describe('Usage in templates', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        TestHostComponent, AsyncTestHostComponent, TrivialHostComponent, SimpleTestHostComponent,
        FnApplyPipe, FnApplyAsyncPipe
      ]
    }).compileComponents();
  });

  it('should apply a method exactly once', fakeAsync(() => {
    const trivialFixture = TestBed.createComponent(TrivialHostComponent);
    const fixture = TestBed.createComponent(TestHostComponent);
    const fn = jasmine.createSpy();
    const otherFn = jasmine.createSpy();
    const argArray = [];
    fixture.componentInstance.setExpression(fn, argArray);
    fixture.detectChanges();
    expect(fn).toHaveBeenCalledTimes(1);
    fixture.componentInstance.setExpression(fn, argArray);
    fixture.detectChanges();
    expect(fn).toHaveBeenCalledTimes(1);
    // For comparison: Use the Trivial Host component with normal function binding
    trivialFixture.componentInstance.setExpression(otherFn);
    trivialFixture.detectChanges();
    trivialFixture.detectChanges();
    expect(otherFn.calls.all().length).toBe(4);
  }));

  it('should return the correct value', fakeAsync(() => {
    const fixture = TestBed.createComponent(TestHostComponent);
    const sum = (a: number, b: number) => a + b;
    const spy = jasmine.createSpy(null, sum).and.callThrough();
    fixture.componentInstance.setExpression(spy, [1, 2]);
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).innerText).toBe('3');
    expect(spy).toHaveBeenCalledWith(1, 2);
    fixture.componentInstance.setExpression(spy, [3, 2]);
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).innerText).toBe('5');
    expect(spy).toHaveBeenCalledTimes(2);
  }));

  it('should work with single arguments', fakeAsync(() => {
    const fixture = TestBed.createComponent(TestHostComponent);
    const square = (a: number) => a * a;
    const spy = jasmine.createSpy(null, square).and.callThrough();
    fixture.componentInstance.setExpression(spy, 3);
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).innerText).toBe('9');
    expect(spy).toHaveBeenCalledWith(3);
    fixture.componentInstance.setExpression(spy, 4);
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).innerText).toBe('16');
    expect(spy).toHaveBeenCalledTimes(2);
  }));

  it('should work with observables', fakeAsync(() => {
    const fixture = TestBed.createComponent(AsyncTestHostComponent);
    const sum = (a: number, b: number) => a + b;
    const spy = jasmine.createSpy(null, sum).and.callThrough();
    const firstArg = new BehaviorSubject<number>(1);
    const secondArg = of(2);
    fixture.componentInstance.setExpression(spy, [firstArg, secondArg]);
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).innerText).toBe('3');
    expect(spy).toHaveBeenCalledWith(1, 2);
    firstArg.next(3);
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).innerText).toBe('5');
    expect(spy).toHaveBeenCalledTimes(2);
  }));

  it('should work with single observable', fakeAsync(() => {
    const fixture = TestBed.createComponent(AsyncTestHostComponent);
    const square = (a: number) => a * a;
    const spy = jasmine.createSpy(null, square).and.callThrough();
    const arg = new BehaviorSubject<number>(3);
    fixture.componentInstance.setExpression(spy, arg);
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).innerText).toBe('9');
    expect(spy).toHaveBeenCalledWith(3);
    arg.next(4);
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).innerText).toBe('16');
    expect(spy).toHaveBeenCalledTimes(2);
  }));

  it('should show warning if observable reference changes frequently', fakeAsync(() => {
    const fixture = TestBed.createComponent(AsyncTestHostComponent);
    const square = (a: number) => a * a;
    const spy = jasmine.createSpy(null, square).and.callThrough();
    const consoleWarn = spyOn(console, 'warn');
    let args: [Observable<number>] = [of(3)];
    fixture.componentInstance.setExpression(spy, args);
    fixture.detectChanges();
    for (let i = 0; i < 15; i++) {
      args = [of(4)];
      fixture.componentInstance.setExpression(spy, args);
      fixture.detectChanges();
    }
    expect(spy).toHaveBeenCalledTimes(16);
    expect(consoleWarn).toHaveBeenCalledOnceWith(
      jasmine.stringMatching(/^\[warning] Your Input values of fnApplyAsync pipe appear to change in high frequency\./)
    );
    expect((fixture.nativeElement as HTMLElement).innerText).toBe('16');
  }));

  it('should not complain when using async correctly with observables', fakeAsync(() => {
    const fixture = TestBed.createComponent(AsyncTestHostComponent);
    const square = (a: number) => a * a;
    const spy = jasmine.createSpy(null, square).and.callThrough();
    const consoleWarn = spyOn(console, 'warn');
    const arg = new BehaviorSubject(3);
    fixture.componentInstance.setExpression(spy, arg);
    fixture.detectChanges();
    for (let i = 0; i < 15; i++) {
      arg.next(4);
      fixture.componentInstance.setExpression(spy, arg);
      fixture.detectChanges();
    }
    expect(spy).toHaveBeenCalledTimes(16);
    expect(consoleWarn).not.toHaveBeenCalled();
    expect((fixture.nativeElement as HTMLElement).innerText).toBe('16');
  }));

  it('should correctly infer the this argument', fakeAsync(() => {
    const fixture = TestBed.createComponent(SimpleTestHostComponent);
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).innerText).toBe('24');
  }));
});
