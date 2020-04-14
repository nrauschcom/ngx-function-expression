# ngx-function-expression
This library adds a new data structure, and the tools of using it to your Angular Application: **Function Expressions**.

## What is it?
Function expressions are used to call your component's functions directly in the template - without re-evaluating them on every change detection cycle.
As I worked with Angular for some time in many teams, I realized that most of the users just go for the simplest way of doing things. This ends in template bindings like `*ngIf='hasPermission()'` - As you probably notice if you're familiar with Angular, this method ends up to be called on every change detection cycle, which is, in the worst case, **hundrets of times per second**.

By using Function Expressions, you can reduce that to _one_ simple call, and you're even able to recompute the result of that method anytime one of the inputs change.

## How does it look like?
Function Expressions follow a simple, yet powerful Syntax. You're currently able to use Function Expressions in four different ways:

| Expression | Corresponds to  |
| --- | --- |
| `method` | `this.method()` |
| `[method, 1, 'abc', param]` | `this.method(1, 'abc', param)` |
| `[obj, method, param]` | `method.apply(obj, param)` |
| `[obj, 'methodName', param]` | `obj[methodName](param)` |

You can simply use them in any template, using the exported `fnCall` pipe.

## Examples

### Evaluate method once

```
<div>{{getUsername | fnCall}}</div>
```
This example will call the method getUsername on the controller (with `this` set to the correct controller!) exactly once and then persist the return value in the view.\
_Note that in this exact example you should rather make the username a property of the controller to not use a function call at all._

### Evaluate method with arguments

```
<div>{{[getUsername, user] | fnCall}}</div>
```
This example will also call the method getUsername on the controller, with the first parameter set to `user`.\
Note that, whenever the input variable `user` changes, the method will be re-evaluated!

### Usage with observables

```
<div>{{[getUsernameObservable, (user$ | async)] | fnCall | async}}</div>
```
In this example, we are using an observable as input to our function, which again returns an observable consumed by the async pipe.\
In the perfect world of Angular, we would implement this exact same example like that in our component:
```
public usernameObservable = this.user$.pipe(switchMap((user) => this.getUsernameObservable(user)));
```
You can definitely argue this logic _should_ go in the component, but lines like that are also messing up the components code and are badly read- and maintainable.

Lazy programmers could also come up with something like that:
```
<div>{{getUsernameObservable(user | async) | async}}</div>
```
which results in the outer async pipe subscribing to a new observable on every change detection cycle.

## Further handling the return value
As for every Pure Angular Pipe, you can take the Return value of this Pipe Transformation for anything you want. Look at the following examples to understand the full possibilities:
```
<component *ngIf="(([getPermissionStream, user | async] | fnCall) | async) === 'READ'">Yey, I have read access!</component>
```

### Providing Context to the Method
Of , you cannot only call the components methods, but also any other functions, while maintaining the correct `this` context. You can simply use the contextual syntax possibilities, including the context object as the first value in a function expression array:
```
<div *ngFor="let item of items">{{[item, 'getSubtotal'] | fnCall}}</div>
or
<div *ngFor="let item of items">{{[item, item.getSubtotal] | fnCall}}</div>
```
By using the first option, you will get a type-safe implementation, because the function expression uses `keyof` to find all methods of your context object.

## Get started!

1. Run `npm install ngx-function-expression`
1. Add the `FunctionExpressionModule` to your application and use the `FnCallPipe` in your templates.
