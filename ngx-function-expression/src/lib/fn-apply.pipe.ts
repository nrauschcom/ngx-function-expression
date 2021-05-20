import {ChangeDetectorRef, Pipe, PipeTransform} from '@angular/core';
import {getExecutionContext} from './get-execution-context';
import {AnyFunction, FunctionParameters, ParametrizedFunction, UnparametrizedFunction} from "./utility-types";
import {_fnApplyHelper} from "./fn-apply-helper";

@Pipe({
  name: 'fnApply',
  pure: true
})
export class FnApplyPipe implements PipeTransform {
  constructor(private readonly changeDetectorRef: ChangeDetectorRef) {}

  /**
   * Pipe used to call the given method once.
   *
   * For more information and usage instructions, you can read the documentation at
   * {@link https://github.com/nrauschcom/ngx-function-expression}
   *
   * The fnApply pipe will call the given Pipe Argument once instead of recalculating the return value in every
   * change detection cycle. Instead of using `[class.hidden]="isHidden()"`, you can use
   * `[class.hidden]="isHidden | fnApply"`, which will evaluate exactly once and then keep the value, because this
   * is a pure pipe. When you use the fnApply pipe with Component Methods, you can just call them right away without
   * explicitly specifying a context object (thisArg).
   *
   * @param method The function which should be called.
   * @param args Arguments passed to the function. Note those will be type-checked.
   * @param thisArg Optional argument to override the thisArg of the called function. If you use a method of the current
   *                component, this can be left empty.
   */
  transform<T extends ParametrizedFunction>(method: T, args: FunctionParameters<T>, thisArg?: unknown): ReturnType<T>;
  /**
   * Pipe used to call the given method once.
   *
   * For more information and usage instructions, you can read the documentation at
   * {@link https://github.com/nrauschcom/ngx-function-expression}
   *
   * The fnApply pipe will call the given Pipe Argument once instead of recalculating the return value in every
   * change detection cycle. Instead of using `[class.hidden]="isHidden()"`, you can use
   * `[class.hidden]="isHidden | fnApply"`, which will evaluate exactly once and then keep the value, because this
   * is a pure pipe. When you use the fnApply pipe with Component Methods, you can just call them right away without
   * explicitly specifying a context object (thisArg).
   *
   * @param method The function which should be called.
   * @param args Arguments passed to the function. Note those will be type-checked.
   * @param thisArg Optional argument to override the thisArg of the called function. If you use a method of the current
   *                component, this can be left empty.
   */
  transform<T extends UnparametrizedFunction>(method: T, args?: [], thisArg?: unknown): ReturnType<T>;
  transform<T extends AnyFunction>(method: T, args: FunctionParameters<T>, thisArg?: unknown): ReturnType<T> {
    return _fnApplyHelper(thisArg ?? getExecutionContext(this.changeDetectorRef), method, args);
  }
}
