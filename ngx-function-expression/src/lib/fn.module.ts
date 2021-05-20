import {NgModule} from '@angular/core';
import {FnCallPipe} from './fn-call.pipe';
import {FnEvaluationService} from './fn-evaluation.service';
import {FnApplyPipe} from "./fn-apply.pipe";
import {FnApplyAsyncPipe} from "./fn-apply-async.pipe";
import {FnMethodPipe} from "./fn-method.pipe";

@NgModule({
  declarations: [FnCallPipe, FnApplyPipe, FnApplyAsyncPipe, FnMethodPipe],
  providers: [FnEvaluationService],
  imports: [],
  exports: [FnCallPipe, FnApplyPipe, FnApplyAsyncPipe, FnMethodPipe]
})
export class FunctionExpressionModule {
}
