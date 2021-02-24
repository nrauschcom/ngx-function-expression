type Fun<R, Args extends unknown[] = unknown[]> = (...args: Args) => R;

/**
 * A function expression with parameters with a return value of type R.
 * This is used like `[functionRef, param1, param2, ...]`
 */
type FunctionExpressionWithArguments<R, F extends Fun<R> = Fun<R>> = [Fun<R>, ...unknown[]];

/**
 * A method call expression with given context.
 * This is used like `[containingObj, 'methodName', param1, param2, ...]`
 */
type MethodFunctionExpression<R, O, K = keyof Extract<O, Fun<R>>>
  = [O, K, ...unknown[]];

/**
 * A method call expression with given context.
 * This is used like `[containingObj, functionRef, param1, param2, ...]`
 */
type ContextFunctionExpression<R, O> = [O, Fun<R>, ...unknown[]];

/**
 * The easiest form of a function expression is just the reference to the function itself.
 * This will be executed in the wrapping context.
 */
type SimplifiedSyntax<R> = () => R;


export type FunctionExpression<R, O = unknown> =
  FunctionExpressionWithArguments<R>
  | ContextFunctionExpression<R, O>
  | MethodFunctionExpression<R, O>
  | SimplifiedSyntax<R>;

export type FunctionExpressionReturnValue<T> = T extends FunctionExpression<infer R> ? R : never;
