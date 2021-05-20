# ngx-function-expression
This library adds new pipes to your Angular Application:
Function Application Pipes (or earlier: Function Expressions).

## Function Application? Why?
... you may ask yourself.
Let's look at a small example:

```ts
@Component({
  template: '{{user.getName()}} <i *ngIf="user.hasEditPermission()" class="fa fa-pencil" (click)="edit()">'
})
```
You probably already know you should avoid such code, but why?  
Angular provides the developer with a handy technique: **Change Detection**. Whenever Template
Inputs change, the result is evaluated and shown to the user. But how does Angular know whether `user.getName()`
changes? Right: _It doesn't_. And because of that, this function is called in every "tick", depending
on your configuration on every mousemove event, every keypress, or just for every frame your application is rendered.
It's maybe not too bad for a plain getter, but you know just like me, this can get out of hands very quickly.

But what if you want to just evaluate a method _once_? Or even better: Once for each combination of arguments you
pass. That's where Pipes come into place. Angular Pure Pipes essentially tell the compiler: As long as my inputs don't
change, my outputs won't change either. Angular Pipes are probably the perfect solution to your problem - but they come
with their own caveats. Each Pipe has to be defined as part of a module, not local to just your component. You will
have to pass component state to your pipe in some cases, or you just don't want to implement pipes for every small
helper function.

So I spent some days working on possible solutions for all the cases in which I needed better capabilities, and I came
up with this module. And I hope, someone out here will read this and think "that's exactly what I need right now".

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
  
**Special Cases for Simple Functions:**
* If your function doesn't take any arguments, you can **omit** the argument array. If you want to use the `thisArg`,
  you can either pass undefined/null or an empty tuple as arguments in that case.
* If your function takes exactly one _non-array_ argument, you can pass this argument directly without adding it to a
  tuple, like `method | fnApply:arg`.

Here's a short summary of how you can achieve exactly the call you want by just using the basic syntax:

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

The last call feels a bit clunky, right? That's where advanced features come into place..

## Advanced Syntax

There are two pipes to simplify the usage of ngx-function expression:

### Working with Observables

Working with observables in your templates is state of the art and thus very common. You're probably already 
familiar with the AsyncPipe provided by @angular/common. That's why I decided to build on the async pipe and add a
`fnApplyAsync` pipe in 2.x. This works exactly like `fnApply`, but takes observables for each argument instead of
directly passing the argument. The typings are automatically generated and validated.

Whenever one of the input observables fires, the output is adjusted. Exactly like the AsyncPipe, this should be used
in combination with [ChangeDetectionStrategy.OnPush](https://angular.io/api/core/ChangeDetectorRef#usage-notes),
to reduce the component's work to a minimum.

By using the `fnApplyAsync` pipe you can simplify your code as follows:

`{{pow | fnApply:[(base$ | async), (exponent$ | async)]}}`  
to  
`{{pow | fnApplyAsync:[base$, exponent$]}}`

While this is a nice simplification and probably cleaning up your templates quite a bit, it is _not necessary_ to write
code like this. You can always use the basic syntax or the one that works best for you and your code style.

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

## Examples

### Applying Pure Functions in the Template
```ts
@Component({
  template: '{{pow | [3, 2]}}, {{math_pow | [4, 2]}}' // will render '9, 16'
})
class TestComponent {
    public math_pow = Math.pow;
    
    pow(base: number, exponent: number): number {
        return Math.pow(base, exponent);
    }
}
```

Obviously, this could also be achieved by implementing a PowerPipe or precalculating the values in the component
rather than in the template, and, most of the time, this is exactly what you _should_ do!  
But as I've seen in multiple projects, people _will_ use component methods in the template - and sometimes it's
even the cleanest or best way in my opinion.

### Dynamically Creating a Stream of Data
```ts
@Component({
  template: '<i *ngIf="hasEditPermissions | fnApply | async" class="fa fa-pencil" (click)="edit()">'
})
class TestComponent {    
    hasEditPermissions(): Observable<boolean> {
        return this.user.permissions$.pipe(map(permissions => permissions.edit));
    }
}
```

When looking at this example, note that using `*ngIf="hasEditPermissions()"` would result in the AsyncPipe
subscribing to a whole new observable in every tick. Just imagine you have some XHR request or costly computations
in the observable you're subscribing to...

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

### Working with Returned Observables

As with any Angular pipe, you can chain them together to receive exactly the results you want.

```ts
@Component({
  template: `Explosion in {{createCountdown | fnApply | async}}`
})
class TestComponent {    
    createCountdown(): Observable<number> {
        return interval(1000);
    }
}
```

## Get Started!

1. Run `npm install ngx-function-expression`.
1. Add the `FunctionExpressionModule` to your application and use the `fnApply`, `fnApplyAsync` and `fnMethod` pipes
   in your templates.

## Further Questions

Feel free to use GitHub issues for further questions, suggestions, feature requests and bug reports.

I'm happy to make this module useful to as many people as possible!

## Known Issues

**`parametrizedFunction | fnApply:[]` works for `parametrizedFunction(requiredArg: ...)`**

Currently, any function that requires parameters can be called with an **empty argument array**. I checked and rewrote
the typings multiple times, but I just won't understand what's wrong or why this even happens. As soon as we provide 
at least one argument to the pipe, the type checking works as expected.  
If you're a TypeScript Goddess or solved a similar issue in the past, feel free to contact me or create a Pull Request!
