import {ChangeDetectorRef} from '@angular/core';

/**
 * This method is used to dynamically resolve a component instance from a given {@link ChangeDetectorRef}.
 * By binding a method using getExecutionContext, you can simply call any method in the context of the current component.
 */
export function getExecutionContext(cdRef: ChangeDetectorRef): unknown {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  return cdRef['context'] ?? cdRef['_lView']?.[8] ?? cdRef['_view']?.['context'];
}
