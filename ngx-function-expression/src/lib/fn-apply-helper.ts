import {AnyFunction, FunctionParameters} from "./utility-types";

export function _fnApplyHelper<T extends AnyFunction>(thisArg: unknown, method: T, args: FunctionParameters<T>): ReturnType<T> {
  return method.apply(thisArg, args === undefined ? [] : (Array.isArray(args) ? args : [args])) as ReturnType<T>;
}
