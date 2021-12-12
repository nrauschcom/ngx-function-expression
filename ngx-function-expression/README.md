# ngx-function-expression

![Build Status](https://img.shields.io/travis/com/nrauschcom/ngx-function-expression?style=for-the-badge)
![Code Coverage](https://img.shields.io/coveralls/github/nrauschcom/ngx-function-expression?style=for-the-badge)
![GitHub issues](https://img.shields.io/github/issues/nrauschcom/ngx-function-expression?style=for-the-badge)

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
Angular provides the developer with a handy technique: Change Detection. Whenever Template
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

## Examples

### Applying Pure Functions in the Template
```ts
@Component({
  template: '{{pow | fnApply:[3, 2]}}, {{math_pow | fnApply:[4, 2]}}' // will render '9, 16'
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

You can check out more examples and the full
[README over at GitHub](https://github.com/nrauschcom/ngx-function-expression/blob/master/README.md#examples)

## Get Started!

1. Run `npm install ngx-function-expression`
1. Add the `FunctionExpressionModule` to your application and use the pipes `fnApply`, `fnApplyAsync` and
   `fnMethod` in your templates.
