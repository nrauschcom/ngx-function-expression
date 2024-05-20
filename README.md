## Performant Pure Function Calls in Angular Templates

![Build Status](https://img.shields.io/travis/com/nrauschcom/ngx-function-expression/main?style=for-the-badge)
![Code Coverage](https://img.shields.io/coveralls/github/nrauschcom/ngx-function-expression?style=for-the-badge)
![GitHub issues](https://img.shields.io/github/issues/nrauschcom/ngx-function-expression?style=for-the-badge)
![Bundle Size](https://img.shields.io/bundlephobia/min/ngx-function-expression?style=for-the-badge)
![License](https://img.shields.io/github/license/nrauschcom/ngx-function-expression?style=for-the-badge)

>**Warning:** For Angular Versions < 13, please use ngx-function-expression@^2.0.0, because the package is Ivy-only as of Dec 2021.

***

Using Functions in Angular Templates is a double-edged sword.

While you can significantly reduce your template code by putting logic in component methods, this idea comes with its own pitfalls:
Because you can't mark a method as [pure](https://en.wikipedia.org/wiki/Pure_function), Angular will keep calling that method
in every change detection cycle, waiting for the outputs to change, resulting in a huge amount of function calls.

By using ngx-function-expression, you are allowing Angular to [memoize](https://en.wikipedia.org/wiki/Memoization)
the result of your function calls as long as the parameters don't change.

This library comes with the following benefits:
 - [Component-scoped method calls](#component-scoped-method-calls) with the correct "this" context
 - [Simple usage](#short-summary-on-how-to-achieve-your-goal) with any kind of methods and parameters
 - [Type-safe](#type-safe-template-usage) template usage
 
***

## Basic Syntax

The Pipes provided by this module have a very simple yet powerful syntax.  
The most basic syntax, already capable of handling all sorts of function calls is the following:
```
function | fnApply:[...args]:thisArg
```
* **function** - A reference to the function you want to apply. This is most likely a public method of the component,
                 or a referenced method of one of the component's public members, like `user.method`.
* **...args** - All the necessary function arguments are passed via a type-checked tuple. If your function does not
                have any parameters, you'll pass an empty tuple. If your function has exactly one number-typed
                parameter, you'll pass a tuple containing exactly one number, and so on. This also works for optional
                parameters as well as rest args.
* **thisArg** - The last parameter of fnApply gives you control over the `this`-context of the function call. In most
                cases, you can just omit this parameter to call the function in the components scope, just as if you
                were calling it with the _call syntax_ (`method()`) from the template. ngx-function-expression always
                infers the component instance as thisArg, if you don't specify it otherwise.

### Short summary on how to achieve your goal

<table>
    <tr>
        <th>Javascript Code</th>
        <th>fnApply Call</th>
    </tr>
    <tr>
        <td><code>component.method()</code></td>
        <td><code>method | fnApply</code></td>
    </tr>
    <tr>
        <td><code>component.method(arg1, ...args)</code></td>
        <td><code>method | fnApply:[arg1, ...args]</code></td>
    </tr>
    <tr>
        <td><code>someObject.method(arg)</code></td>
        <td><code>someObject.method | fnApply:[arg]:someObject</code></td>
    </tr>
</table>

***

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

### Calling Instance Methods
```ts
@Component({
  template: `<i *ngIf="user | fnMethod:'hasEditPermissions'">`
})
class TestComponent {    
    hasEditPermissions(): Observable<boolean> {
        return this.user.permissions$.pipe(map(permissions => permissions.edit));
    }
}
```

***

## Syntactic Sugar

### Special Cases for Simple Functions:

* If your function doesn't take any arguments, you can **omit** the argument array. If you want to use the `thisArg`,
  you can either pass undefined/null or an empty tuple as arguments in that case.
* If your function takes exactly one _non-array_ argument, you can pass this argument directly without adding it to a
  tuple, like `method | fnApply:arg`.

### Calling Instance Methods on Your Data

As you've seen before, you can call methods on any object in your scope with the basic syntax:  
`{{obj.getName | fnApply:[]:obj}}`

What's bothering is that you have to specify the reference object twice - once to get a reference to the method, and
then again to set it as the correct `this` argument. This is not only hardly readable, but is also very easy to
forget the last parameter and thus getting wrong results, which are frustrating to debug.

To simplify this experience and save you some precious debugging time, there's another syntax to directly call a method
on a given reference object: `fnMethod`. You can use it like this:

`{{obj | fnMethod:'getName':[]}}` _(of course, the empty argument list is optional)_

As you type, your IDE will automatically list possible public methods, automatically extracted from the reference
objects type. Even with this syntax, your arguments and return type will be type-checked and result in a type-safe
template. While this is not necessarily shorter, I think it's way easier to read and understand what happens in this
example, because the syntax is more similar to a normal method call.

***

## Advantages over other solutions

### Component-scoped method calls

When using fnApply on a component method, the library will automatically bind the method to your component instance.
This can simplify several use-cases where other solutions are overly verbose or even impossible, because data is only available in that component.

**Example:**

```ts
@Component({
  template: `<div *ngFor="let listItem of list"
                  [hidden]="!(hasPermissionsForItem | fnApply:listItem)">`
})
class ListComponent {
    public list: ListItem[];
    private user: User;
    
    public hasPermissionsForItem(listItem: ListItem): boolean {
        return this.user.permissions.check(listItem);
    }
}
```

### Type-safe template usage

ngx-function-expression will always try to infer the parameter types and the return type of your given function, allowing you to write type-safe templates.

**Example:**

```ts
@Component({
  template: `
    {{(add | fnApply:[1, 'Carl'])}}  // Won't compile, because add expects number arguments
    {{(add | fnApply:[1, 2])}}       // Works fine
  `
})
class ComplexMathsComponent implements PunIntended {
    public add(l: number, r: number) {
      return l + r;
    }
}
```

***

## Get Started!

1. Run `npm install ngx-function-expression`.
1. Add the `FunctionExpressionModule` to your application and use the `fnApply` and `fnMethod` pipes
   in your templates.

## Further Questions

Feel free to use GitHub issues for further questions, suggestions, feature requests and bug reports.

I'm happy to make this module useful to as many people as possible!

## Changelog

See [CHANGELOG.md](https://github.com/nrauschcom/ngx-function-expression/blob/master/CHANGELOG.md)

## Known Issues

**`parametrizedFunction | fnApply:[]` works for `parametrizedFunction(requiredArg: ...)`**

Currently, any function that requires parameters can be called with an **empty argument array**. I checked and rewrote
the typings multiple times, but I just won't understand what's wrong or why this even happens. As soon as we provide 
at least one argument to the pipe, the type checking works as expected.  
If you're a TypeScript Goddess or solved a similar issue in the past, feel free to contact me or create a Pull Request!
