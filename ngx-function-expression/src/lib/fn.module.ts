import {NgModule} from '@angular/core';
import {FnApplyPipe} from "./fn-apply.pipe";
import {FnMethodPipe} from "./fn-method.pipe";

@NgModule({
  declarations: [FnApplyPipe, FnMethodPipe],
  imports: [],
  exports: [FnApplyPipe, FnMethodPipe]
})
export class FunctionExpressionModule {
}
