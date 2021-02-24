import {ChangeDetectorRef, Pipe, PipeTransform} from '@angular/core';
import {FnEvaluationService} from './fn-evaluation.service';
import {FunctionExpression, FunctionExpressionReturnValue} from './fn-function-expression.type';
import {getExecutionContext} from './get-execution-context';

/**
 * Pipe used to call {@see FunctionExpression} on the change of input values.
 *
 * This Pipe calls the function provided in a given function expression. The given function can use the `this` context
 * of the wrapping component's context. Using the Context Syntax of a function expression, it is also possible to call
 * functions in a custom context.
 *
 * Whenever the context or one of the input values of the given Function Expression changes, the pipe is re-evaluated.
 *
 * @usageNotes
 *
 * There are several ways of using this directive:
 *
 * - Simple Function call
 * ```
 * <div>{{localFunction | fnCall}}</div>
 * ```
 * This will call the components `localFunction` method once, resolving and keeping the return value for the components
 * lifetime.
 *
 * - Simple function call with arguments
 * ```
 * <div>{{[localFunction, 1, 'abc', localVar] | fnCall}}</div>
 * ```
 * This will call the components `localFunction` method with the parameters 1, 'abc' and a local variable. Note that the
 * function will be re-evaluated whenever localVar changes.
 *
 * - Function call with custom context
 * ```
 * <div *ngFor='let item of items'>{{[item, 'getName'] | fnCall}}</div>
 * or
 * <div *ngFor='let item of items'>{{[item, item.getName] | fnCall}}</div>
 * ```
 *
 * This will call the item's method `getName` with the `this` parameter set to each individual item. Note that without
 * the context override, the getName method will be called with `this` set to the component, resulting in unexpected
 * behavior. Prefer the first syntax for type safety in the expression.
 *
 * - Usage in Directives
 * ```
 * <div *ngIf='showDiv | fnCall'>Only shown when this.showDiv() evaluates to true.</div>
 * ```
 * As you can see in the above example, you can use the fnCall pipe in any directive. In this example, when `showDiv()`
 * returns true (or any truthy value), the div is shown. Note that the function is only evaluated ONCE, it will not
 * react to any changes in the component, because it has no input values.
 * In this case, it would probably make more sense to make showDiv a property of the component.
 * Using `[showDiv, user] | fnCall` the function will be called with the parameter `user` whenever the user changes.
 * You can also compare the returned value, further pipe it or do anything you want with it:
 * ```
 * <div *ngIf='([getPermissions, user] | fnCall | async) === "READ_PERMISSION"'>...</div>
 * ```
 *
 * - Function call with async arguments
 * ```
 * <div>{{[localFunction, (localObservable | async)] | fnCall}}</div>
 * ```
 * You can use the async pipe to use this pipe with Observable Inputs. In the above example, `localFunction` will be re-
 * evaluated whenever `localObservable` emits, to keep the view up-to-date.
 *
 * - Async return values
 * ```
 * <div>{{localFunction | fnCall | async}}</div>
 * ```
 * `localFunction` can even return an observable itself, which can be directly consumed by another async pipe. Note that
 * you can also mix the above examples, to create efficient, but most likely hard to read observable chains.
 *
 * - Getting fancy: Stacking FnCall-Pipes
 * ```
 * <div>{{[localFunction, ([anotherFunction, localVar] | fnCall)] | fnCall}}</div>
 * ```
 * In this example, `anotherFunction` will be called whenever `localVar` changes, which will, again, trigger the
 * evaluation of `localFunction` with the return value. This is comparable to just stacking the functions in the
 * component itself like `this.localFunction(this.anotherFunction(this.localVar))`.
 */
@Pipe({
  name: 'fnCall',
  pure: true
})
export class FnCallPipe<K extends FunctionExpression<unknown>> implements PipeTransform {

  constructor(private changeDetectorRef: ChangeDetectorRef, private evaluationService: FnEvaluationService) {
  }

  transform(value: K, ...args: unknown[]): FunctionExpressionReturnValue<K> {
    return this.evaluationService.resolveFunctionExpression<FunctionExpressionReturnValue<K>>
      (value as FunctionExpression<FunctionExpressionReturnValue<K>>, getExecutionContext(this.changeDetectorRef));
  }

}
