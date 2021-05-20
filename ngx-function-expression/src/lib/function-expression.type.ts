/**
 * @deprecated since 2.0
 */
type Fun<R, Args extends Array<unknown> = Array<unknown>> = (...args: Args) => R;

/**
 * @deprecated since 2.0
 */
type ExtractMethods<O, R = any> = {
  [K in keyof O]: (O[K] extends Fun<R> ? K : never)
}[string & keyof O];

/**
 * A function expression with parameters with a return value of type R.
 * This is used like `[functionRef, param1, param2, ...]`
 *
 * @deprecated since 2.0
 */
export type FunctionExpressionWithArguments<R, F extends Fun<R> = Fun<R>> = [Fun<R>, ...unknown[]];

/**
 * A method call expression with given context.
 * This is used like `[containingObj, 'methodName', param1, param2, ...]`
 *
 * @deprecated since 2.0
 */
export type MethodFunctionExpression<R, O>
  = [O, ExtractMethods<O, R>, ...unknown[]];

/**
 * A method call expression with given context.
 * This is used like `[containingObj, functionRef, param1, param2, ...]`
 *
 * @deprecated since 2.0
 */
export type ContextFunctionExpression<R, O> = [O, Fun<R>, ...unknown[]];

/**
 * The easiest form of a function expression is just the reference to the function itself.
 * This will be executed in the wrapping context.
 *
 * @deprecated since 2.0
 */
export type SimplifiedSyntax<R> = Fun<R>;

/**
 * @deprecated since 2.0
 */
export type FunctionExpression<R, O = any> =
  FunctionExpressionWithArguments<R>
  | ContextFunctionExpression<R, O>
  | MethodFunctionExpression<R, O>
  | SimplifiedSyntax<R>;

/**
 * @deprecated since 2.0
 */
export type FnReturnType<T> = T extends FunctionExpression<infer R> ? R : never;
