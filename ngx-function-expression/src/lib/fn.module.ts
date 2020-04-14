import {NgModule} from '@angular/core';
import {FnCallPipe} from './fn-call.pipe';
import {FnEvaluationService} from './fn-evaluation.service';

@NgModule({
  declarations: [FnCallPipe],
  providers: [FnEvaluationService],
  imports: [],
  exports: [FnCallPipe]
})
export class FunctionExpressionModule {
}
