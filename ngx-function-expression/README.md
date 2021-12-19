## Performant Pure Function Calls in Angular Templates

![Build Status](https://img.shields.io/travis/com/nrauschcom/ngx-function-expression?style=for-the-badge)
![Code Coverage](https://img.shields.io/coveralls/github/nrauschcom/ngx-function-expression?style=for-the-badge)
![GitHub issues](https://img.shields.io/github/issues/nrauschcom/ngx-function-expression?style=for-the-badge)

>**Warning:** For Angular Versions < 13, please use ngx-function-expression@^2.0.0, because the package is Ivy-only as of Dec 2021.

***

Using Functions in Angular Templates is a double-edged sword.

While you can significantly reduce your template code by putting logic in component methods, this idea comes with its own pitfalls:
Because you can't mark a method as [pure](https://en.wikipedia.org/wiki/Pure_function), Angular will keep calling that method
in every change detection cycle, waiting for the outputs to change, resulting in a huge amount of function calls.

By using ngx-function-expression, you are allowing Angular to [memoize](https://en.wikipedia.org/wiki/Memoization)
the result of your function calls as long as the parameters don't change.

This library comes with the following benefits:
 - [Component-scoped method calls](https://github.com/nrauschcom/ngx-function-expression/blob/master/README.md#component-scoped-method-calls) with the correct "this" context
 - [Simple usage](https://github.com/nrauschcom/ngx-function-expression/blob/master/README.md#short-summary-on-how-to-achieve-your-goal) with any kind of methods and parameters
 - [Type-safe](https://github.com/nrauschcom/ngx-function-expression/blob/master/README.md#type-safe-template-usage) template usage

## Examples

### Applying Component Methods in the Template
```ts
@Component({
  template: '{{pow | fnApply:[3, 2]}}' // will render '9'
})
class TestComponent {
    public pow(base: number, exponent: number): number {
        return Math.pow(base, exponent);
    }
}
```

Obviously, this could also be achieved by implementing a PowerPipe or precalculating the values in the component
rather than in the template, and, most of the time, this is exactly what you _should_ do!

But in reality, people will not write a pipe for every operation, or some methods are better contained in a component to access the context of that component.

### Dynamically Creating a Stream of Data

As with any Angular pipe, you can chain them together to receive exactly the results you want.

```ts
@Component({
  template: `Explosion in {{createCountdown | fnApply | async}}`
})
class TestComponent {
  createCountdown(): Observable<number> {
    return interval(1000).pipe(take(5), map(i => 5 - i));
  }
}
```

When looking at this example, note that using `{{createCountdown() | async}}` would result in the AsyncPipe
subscribing to a whole new observable in every tick, keeping the countdown on 5 forever.  
Using fnApply will call the method exactly once and then listen to changes on the returned observable using AsyncPipe.

Just imagine you have some XHR request or costly computations in the observable you're subscribing to...

***

You can check out more examples and the full
[README over at GitHub](https://github.com/nrauschcom/ngx-function-expression/blob/master/README.md#examples)

## Get Started!

1. Run `npm install ngx-function-expression`
1. Add the `FunctionExpressionModule` to your application and use the pipes `fnApply` and `fnMethod` in your templates.
