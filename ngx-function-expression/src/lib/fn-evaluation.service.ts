import {Injectable, isDevMode} from '@angular/core';
import {FunctionExpression} from './fn-function-expression.type';

@Injectable({
  providedIn: 'root'
})
export class FnEvaluationService {

  private warningsEnabled = isDevMode();

  private static checkContext(context: unknown, fnName: string): void {
    if (!context) {
      console.warn(`You are calling a method ${fnName} without any context object. If you are using an unsupported version of Angular, `
        + `you always have to specify the context of a method execution like [this, method, ...] instead of the automatic context resolving in `
        + `in ngx-function-expression. This warning appears in the development environment only. If you do exactly know what you're doing, `
        + `you can, however, turn it off using FnEvaluationService.suppressWarnings().`);
    }
    if (context && typeof context[fnName] !== 'function') {
      console.warn(`The method "${fnName}" should probably not be executed in the given context "${context.constructor.name}". `
        + `This warning appears in the development environment only. If you do exactly know what you're doing, you can, however, turn it `
        + `off using FnEvaluationService.suppressWarnings().`, context);
    }
  }

  constructor() {
  }

  suppressWarnings() {
    this.warningsEnabled = false;
  }

  isValidFunctionExpression<TReturn>(expr: unknown): expr is FunctionExpression<TReturn> {
    return expr instanceof Function
      || Array.isArray(expr) && (
        expr[0] instanceof Function
        || expr.length > 1 && (
          expr[0] instanceof Object && expr[1] instanceof Function
          || expr[0] instanceof Object && typeof expr[1] === 'string'
        )
      );
  }

  resolveFunctionExpression<TReturn>(expr: FunctionExpression<TReturn>, context?: unknown): TReturn {
    if (Array.isArray(expr) && expr[0] instanceof Object) {
      if (expr[0] instanceof Function) {
        if (this.warningsEnabled) {
          FnEvaluationService.checkContext(context, expr[0].name);
        }
        return expr[0].apply(context ?? null, expr.slice(1));
      } else if (expr[1] instanceof Function) {
        if (this.warningsEnabled) {
          FnEvaluationService.checkContext(expr[0], expr[1].name);
        }
        return expr[1].apply(expr[0], expr.slice(2));
      } else if (typeof expr[1] === 'string') {
        if (this.warningsEnabled) {
          FnEvaluationService.checkContext(expr[0], expr[1]);
        }
        return expr[0][expr[1]].apply(expr[0], expr.slice(2));
      }
    } else if (expr instanceof Function) {
      return expr.apply(context);
    }
    throw new Error('Invalid Function Expression. Please read the documentation.');
  }
}
