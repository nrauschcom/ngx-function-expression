import {NgModule} from '@angular/core';
import {FnApplyPipe} from "./fn-apply.pipe";
import {FnApplyAsyncPipe} from "./fn-apply-async.pipe";
import {FnMethodPipe} from "./fn-method.pipe";

@NgModule({
  declarations: [FnApplyPipe, FnApplyAsyncPipe, FnMethodPipe],
  imports: [],
  exports: [FnApplyPipe, FnApplyAsyncPipe, FnMethodPipe]
})
export class FunctionExpressionModule {
}
