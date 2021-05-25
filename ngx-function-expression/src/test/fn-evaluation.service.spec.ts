import {TestBed} from '@angular/core/testing';

import {FnEvaluationService} from '../lib/fn-evaluation.service';

describe('FnEvaluationService', () => {
  let service: FnEvaluationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FnEvaluationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should correctly identify function expression', () => {
    expect(service.isValidFunctionExpression(() => void 0)).toBeTrue();
    expect(service.isValidFunctionExpression([() => void 0, 1, 2, 3])).toBeTrue();
    expect(service.isValidFunctionExpression([{}, () => void 0, 1, 2, 3])).toBeTrue();
    expect(service.isValidFunctionExpression([{}, 'test', 1, 2, 3])).toBeTrue();
    expect(service.isValidFunctionExpression([service, service.isValidFunctionExpression])).toBeTrue();
    expect(service.isValidFunctionExpression([service, 'isValidFunctionExpression'])).toBeTrue();
    expect(service.isValidFunctionExpression(['isValidFunctionExpression'])).toBeFalse();
    expect(service.isValidFunctionExpression(5)).toBeFalse();
    expect(service.isValidFunctionExpression('hello')).toBeFalse();
    expect(service.isValidFunctionExpression(service)).toBeFalse();
  });

  it('should throw for invalid input', () => {
    expect(() => service.resolveLegacyFunctionExpression(['isValidFunctionExpression'] as any)).toThrow();
    expect(() => service.resolveLegacyFunctionExpression(5 as any)).toThrow();
    expect(() => service.resolveLegacyFunctionExpression('hello' as any)).toThrow();
    expect(() => service.resolveLegacyFunctionExpression(service as any)).toThrow();
  });

  it('should warn if no context is given', () => {
    const spy = spyOn(console, 'warn');

    function test() {
    }

    service.resolveLegacyFunctionExpression([test], undefined);
    expect(spy).toHaveBeenCalled();
    expect(spy.calls.argsFor(2)[0]).toEqual(jasmine.stringMatching(/^You are calling a method/));
  });

  it('should identify and warn wrong usage of methods', () => {
    const spy = spyOn(console, 'warn');

    function test() {
    }

    service.resolveLegacyFunctionExpression([{}, test]);
    expect(spy).toHaveBeenCalled();
    expect(spy.calls.argsFor(2)[0]).toEqual('The method "test" should probably not be executed in the given context "Object". ' +
      'This warning appears in the development environment only. If you do exactly know what you\'re doing, you can, however, ' +
      'turn it off using FnEvaluationService.suppressWarnings().');
  });

  it('should work with named methods', () => {
    const obj = {
      test: () => 45
    }

    const spy = spyOn(obj, 'test').and.callThrough();

    service.resolveLegacyFunctionExpression([obj, 'test']);
    expect(spy).toHaveBeenCalled();
  });

  it('should throw on invalid expression', () => {
    const obj = {}

    expect(() => service.resolveLegacyFunctionExpression([obj, 3 as unknown as string])).toThrow();
  });

  it('should show deprecation warning', () => {
    const spy = spyOn(console, 'warn');

    function test() {
    }

    service.resolveLegacyFunctionExpression([{}, test]);
    expect(spy).toHaveBeenCalled();
    expect(spy.calls.argsFor(0)[0]).toEqual('[deprecation] ngx-function-expression');
  });
});
