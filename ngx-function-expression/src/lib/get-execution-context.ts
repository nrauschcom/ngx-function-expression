import {ChangeDetectorRef} from '@angular/core';

export function getExecutionContext(cdRef: ChangeDetectorRef): object {
  // tslint:disable-next-line:no-string-literal
  return cdRef['context'] ?? cdRef['_lView']?.[8] ?? cdRef['_view']?.['context'];
}
