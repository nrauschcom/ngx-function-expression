import {ChangeDetectorRef} from '@angular/core';

export function getExecutionContext(cdRef: ChangeDetectorRef): unknown {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  return cdRef['context'] ?? cdRef['_lView']?.[8] ?? cdRef['_view']?.['context'];
}
