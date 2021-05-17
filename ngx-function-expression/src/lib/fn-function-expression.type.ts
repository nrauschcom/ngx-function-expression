export type Fun<R, Args extends Array<unknown> = Array<unknown>> = (...args: Args) => R;

export type ExtractMethods<O, R = any> = {
  [K in keyof O]: (O[K] extends Fun<R> ? K : never)
}[string & keyof O];

/**
 * A function expression with parameters with a return value of type R.
 * This is used like `[functionRef, param1, param2, ...]`
 */
export type FunctionExpressionWithArguments<R, F extends Fun<R> = Fun<R>> = [Fun<R>, ...unknown[]];

/**
 * A method call expression with given context.
 * This is used like `[containingObj, 'methodName', param1, param2, ...]`
 */
export type MethodFunctionExpression<R, O>
  = [O, ExtractMethods<O, R>, ...unknown[]];

/**
 * A method call expression with given context.
 * This is used like `[containingObj, functionRef, param1, param2, ...]`
 */
export type ContextFunctionExpression<R, O> = [O, Fun<R>, ...unknown[]];

/**
 * The easiest form of a function expression is just the reference to the function itself.
 * This will be executed in the wrapping context.
 */
export type SimplifiedSyntax<R> = Fun<R>;

export type FunctionExpression<R, O = any> =
  FunctionExpressionWithArguments<R>
  | ContextFunctionExpression<R, O>
  | MethodFunctionExpression<R, O>
  | SimplifiedSyntax<R>;

export type FnReturnType<T> = T extends FunctionExpression<infer R> ? R : never;
