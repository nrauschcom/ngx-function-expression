import {FnCallPipe} from '../lib/fn-call.pipe';
import {TestBed} from '@angular/core/testing';
import {FnEvaluationService} from '../lib/fn-evaluation.service';
import {SpyChangeDetectorRef} from './spies';
import createSpy = jasmine.createSpy;
import {FunctionExpression} from "../lib/fn-function-expression.type";

describe('Pipe: fnCall', () => {
  let callPipe: FnCallPipe<any>;
  let changeDetectorRef: any;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [FnCallPipe]
    });
    TestBed.inject(FnEvaluationService).suppressWarnings();
    changeDetectorRef = new SpyChangeDetectorRef();
    callPipe = new FnCallPipe(changeDetectorRef, TestBed.inject(FnEvaluationService));
  });

  it('create an instance', () => {
    expect(callPipe).not.toBeNull();
  });

  it('should call given simple function expression', () => {
    const spy = createSpy();
    callPipe.transform(spy);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should call given simple function expression with arguments', () => {
    const spy = createSpy();
    callPipe.transform([spy, 2, 3, 4]);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith(2, 3, 4);
  });

  it('should call given contextual function expression', () => {
    const ctx = {};
    const spy = createSpy();
    callPipe.transform([ctx, spy, 2, 3, 4]);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith(2, 3, 4);
    expect(spy.calls.first().object).toBe(ctx);
  });

  it('should call given contextual method expression', () => {
    const spy = createSpy('test', (..._: unknown[]) => 1);
    const ctx = {
      method: spy
    };
    const fnExpr: FunctionExpression<string> = [ctx, 'method', 2, 3, 4];
    callPipe.transform(fnExpr);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith(2, 3, 4);
    expect(spy.calls.first().object).toBe(ctx);
  });
});
