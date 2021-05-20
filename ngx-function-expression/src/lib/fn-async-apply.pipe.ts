import {ChangeDetectorRef, isDevMode, OnDestroy, Pipe, PipeTransform} from '@angular/core';
import {getExecutionContext} from './get-execution-context';
import {FunctionParameters, ObservableParameters, ParametrizedFunction, UnparametrizedFunction} from "./utility-types";
import {combineLatest, Observable, Subscription} from "rxjs";
import {FnApplyPipe} from "./fn-apply.pipe";
import {map} from "rxjs/operators";
import {AsyncPipe} from "@angular/common";
import {FnMethodPipe} from "./fn-method.pipe";
import {_fnApplyHelper} from "./fn-apply-helper";

@Pipe({
  name: 'fnApplyAsync',
  pure: false
})
export class FnApplyAsyncPipe<T extends ParametrizedFunction> implements OnDestroy {
  private static shownWarning = false;
  private _sub: Subscription;
  private _method: T;
  private _args: ObservableParameters<T>;
  private _thisArg: unknown;
  private _latestValue: ReturnType<T>;
  private _inputChanges = 0;

  constructor(private readonly changeDetectorRef: ChangeDetectorRef) {
  }

  /**
   * Pipe used to call the given method as a RxJS map operation.
   *
   * For more information and usage instructions, you can read the documentation at
   * {@link https://github.com/nrauschcom/ngx-function-expression}
   *
   * The fnApplyAsync pipe will call the given Pipe Argument once for every changed observable input instead of
   * recalculating the return value in every change detection cycle.
   *
   * @param method The function which should be called.
   * @param args Arguments passed to the function as Observables. Make sure the references to those observables
   *             won't change, only pass new values through those observables.
   * @param thisArg Optional argument to override the thisArg of the called function. If you use a method of the current
   *                component, this can be left empty.
   */
  transform(method: T, args: ObservableParameters<T>, thisArg?: unknown): ReturnType<T> {
    if (this._sub && (this._method !== method || this._thisArg !== thisArg || !this.argsEqual(args, this._args))) {
      this._inputChanges++;
      if (!FnApplyAsyncPipe.shownWarning && isDevMode() && this._inputChanges === 5) {
        console.warn('[warning] Your Input values of fnApplyAsync pipe appear to change in high frequency.' +
          'You should pass them as observables and only change the internal state by using next().\n' +
          'This warning will not show up in a production environment. For more information, consult the docs.')
      }
      this.reset();
    }
    if (!this._sub) {
      this._method = method;
      this._thisArg = thisArg;
      this._args = args;
      this._sub = combineLatest(args instanceof Observable ? [args] : args).pipe(
        map((currentArgs: Parameters<T>) => {
          return _fnApplyHelper(thisArg, method, currentArgs as FunctionParameters<T>);
        })
      ).subscribe((value): void => {
        this._latestValue = value;
        this.changeDetectorRef.markForCheck();
      })
    }
    return this._latestValue;
  }

  ngOnDestroy() {
    this.reset();
  }

  private argsEqual(one: ObservableParameters<T>, other: ObservableParameters<T>) {
    if (Array.isArray(one)) {
      return one.every((arg, idx) => arg === other?.[idx]);
    }
    return one === other;
  }

  private reset() {
    this._sub?.unsubscribe();
    this._sub = undefined;
    this._method = undefined;
    this._args = undefined;
    this._thisArg = undefined;
  }
}
