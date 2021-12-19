# Migration to 2.x
Hey there, glad you're here! I have some really exciting news for you:
I've been rewriting the whole Module ngx-function-expression, and now provide a
completely **type-checked** implementation and other cool stuff!

**But what does that mean?**  
I really tried to make our the old tuple function expressions type-safe,
but limitations of the Angular template compilation and TypeScript make it very
hard to provide proper typings. Also, even if it'd work, error messages and markers
would be completely useless to the developer, so I just decided to start from scratch
and build a new syntax, which is even more powerful.

I'm sure you will also love it!

If you have any reason to stay with the old expressions and don't rely on type-checking
or even want to bypass it for some reason, you can always stick to the Version Range `^1.2.1`.
I will provide further bugfixes, dependency updates and security-related fixes for the
foreseeable future.

## How to migrate

First: Yes, the migration is easy. The syntax has changed quite a bit, but concepts are still
the same, and you should be able to migrate the module in a few simple steps.

As mentioned in the documentation, the new syntax is the following:
```js
fn | fnApply:[...args?]:[thisArg?]
```

As you can see, we no longer allow a tuple with function and arguments passed in, but only the
function as the main pipe argument. This is the only mandatory argument for parameterless functions,
so you can just use `getRandomNumber | fnApply` in your template to receive a one-time result from
the given function.

You're already familiar with the context inferring mechanism of v1.x and this still applies:  
If you don't specify a `thisArg`, the fnApply pipe will always fall back to the Component instance
you're in. So you can simply use component methods without explicitly passing `this`.

Arguments and the return type of your pipe are now type-checked. If you have a method `sum(a: number,
b: number): number`, you __must__ pass an argument tuple, and this tuple __must__ consist of two numbers.
You can also only use it where angular allows a number as a return type.

For example, if you want to pass a value to a `number`-typed input like in the following snippet,
your called function __must__ return a number.
```ts
@Component({selector: 'some-component'})
class SomeComponent {
  @Input()
  width: number;
  
  sum(a: number, b: number): number {
      return a + b;
  }
  
  toUpperCase(input: string): string {
      return input.toUpperCase();
  }
}
```
```angular2html
<some-component [width]="sum | fnApply:[1, 2]"></some-component>
                         ^ will work, because we're passing a number

<some-component [width]="toUpperCase | fnApply:['test']"></some-component>
                         ^ will NOT compile, because toUpperCase returns a string!
```

## Migration Table

In 1.x of ngx-function-expression, I promoted four different ways of using function expressions.  
In the following table, I will illustrate how to update each single one of those:

<table>
    <tr>
        <th>Old Expression</th>
        <th>Migrate to</th>
    </tr>
    <tr>
        <td><code>method | fnCall</code></td>
        <td><code>method | fnApply</code></td>
    </tr>
    <tr>
        <td><code>[method, ...args] | fnCall</code></td>
        <td><code>method | fnApply:[...args]</code></td>
    </tr>
    <tr>
        <td><code>[thisArg, method, ...args] | fnCall</code></td>
        <td><code>method | fnApply:[...args]:thisArg</code></td>
    </tr>
    <tr>
        <td><code>[obj, 'methodName', ...args] | fnCall</code></td>
        <td>
            <code>obj.methodName | fnApply:[...args]:obj</code><br/>
            <em>or</em><br/>
            <code>obj | fnMethod:'methodName':[...args]</code>
        </td>
    </tr>
</table>

As you can see, most of the transition is very trivial, only the named access was removed
in favor of simplification and to prevent ambiguity.

## New Features

To further simplify the usage of ngx-function-expression, I added some utility functions to 2.x.
You can read more about the new pipe fnMethod in the 
[README](https://github.com/nrauschcom/ngx-function-expression/blob/master/README.md).
