export type ParametrizedFunction = (arg1: unknown, ...args: unknown[]) => unknown;
export type UnparametrizedFunction = () => unknown;
export type AnyFunction = ParametrizedFunction | UnparametrizedFunction;

type SingleParameter<F> = (F extends (arg: infer SingleArgType) => unknown
  ? SingleArgType extends Array<unknown> ? never : SingleArgType : never)

export type FunctionParameters<F extends ParametrizedFunction> = Parameters<F> | SingleParameter<F>;
