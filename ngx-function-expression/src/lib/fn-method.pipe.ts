import {Pipe, PipeTransform} from '@angular/core';
import {FunctionParameters, ParametrizedFunction, UnparametrizedFunction} from "./utility-types";
import {_fnApplyHelper} from "./fn-apply-helper";

type MethodParameters<C, M extends keyof C> = C[M] extends ParametrizedFunction ? FunctionParameters<C[M]> : never;
type MethodReturnType<C, M extends keyof C> = C[M] extends ParametrizedFunction ? ReturnType<C[M]> : never;

type UnparametrizedMethods<C> = {
  [K in keyof C]: C[K] extends UnparametrizedFunction ? K : never;
}[keyof C & string];

type ParametrizedMethods<C> = {
  [K in keyof C]: C[K] extends ParametrizedFunction
    ? Parameters<C[K]> extends [] ? never : K
    : never;
}[keyof C & string];

type Methods<C> = UnparametrizedMethods<C> | ParametrizedMethods<C>;

@Pipe({
  name: 'fnMethod',
  pure: true
})
export class FnMethodPipe implements PipeTransform {
  constructor() {}

  /**
   * Pipe used to call a named method on a context object.
   *
   * This is just a simplified syntax of the fnApply pipe and you don't have to use it.
   * Instead ov writing `obj.method | fnApply:[...args]:obj`, you can simplify to `obj | fnMethod:'method':[...args]`,
   * which can result in a more readable code, because in the fnApply case, you are likely to miss the context object.
   *
   * @param context   Object used to call the given method on
   * @param method    Name of the method to call, which must be an actual method of {@param context}
   * @param args      List of arguments, passed to the method. If the method has no arguments, you can omit this
   *                  parameter. If the method has exactly one non-array parameter, you can pass the parameter directly.
   */
  transform<C, M extends keyof C & ParametrizedMethods<C>>(context: C, method: M, args: MethodParameters<C, M>): MethodReturnType<C, M>;
  /**
   * Pipe used to call a named method on a context object.
   *
   * This is just a simplified syntax of the fnApply pipe and you don't have to use it.
   * Instead ov writing `obj.method | fnApply:[...args]:obj`, you can simplify to `obj | fnMethod:'method':[...args]`,
   * which can result in a more readable code, because in the fnApply case, you are likely to miss the context object.
   *
   * @param context   Object used to call the given method on
   * @param method    Name of the method to call, which must be an actual method of {@param context}
   * @param args      List of arguments, passed to the method. If the method has no arguments, you can omit this
   *                  parameter. If the method has exactly one non-array parameter, you can pass the parameter directly.
   */
  transform<C, M extends keyof C & UnparametrizedMethods<C>>(context: C, method: M, args?: []): MethodReturnType<C, M>;
  transform<C, M extends Methods<C>>(context: C, method: M, args: MethodParameters<C, M>): MethodReturnType<C, M> {
    return _fnApplyHelper(context, context[method], args) as MethodReturnType<C, M>;
  }
}
