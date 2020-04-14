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
    expect(() => service.resolveFunctionExpression(['isValidFunctionExpression'] as any)).toThrow();
    expect(() => service.resolveFunctionExpression(5 as any)).toThrow();
    expect(() => service.resolveFunctionExpression('hello' as any)).toThrow();
    expect(() => service.resolveFunctionExpression(service as any)).toThrow();
  });

  it('should identify and warn wrong usage of methods', () => {
    const spy = spyOn(console, 'warn');

    function test() {
    }

    service.resolveFunctionExpression([{}, test]);
    expect(spy).toHaveBeenCalled();
    expect(spy.calls.first().args[0]).toEqual('The method "test" should probably not be executed in the given context "Object". ' +
      'This warning appears in the development environment only. If you do exactly know what you\'re doing, you can, however, ' +
      'turn it off using FnEvaluationService.suppressWarnings().');
  });
});
