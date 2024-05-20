import {TestBed} from "@angular/core/testing";
import {SpyChangeDetectorRef} from "./spies";
import {FnApplyPipe} from "../lib/fn-apply.pipe";
import {ChangeDetectorRef} from "@angular/core";

describe('Pipe: fnApply', () => {
  let pipe: FnApplyPipe;
  let changeDetectorRef: ChangeDetectorRef;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FnApplyPipe]
    });
    changeDetectorRef = new SpyChangeDetectorRef() as ChangeDetectorRef;
    pipe = new FnApplyPipe(changeDetectorRef);
  });

  it('should apply the method without arguments', () => {
    const spy = jasmine.createSpy('', () => 1);
    pipe.transform(spy);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should apply the method with arguments', () => {
    const spy = jasmine.createSpy('', (a: number, b: number) => a + b);
    pipe.transform(spy, [1, 2]);
    expect(spy).toHaveBeenCalledOnceWith(1, 2);
  });

  it('should apply the method with correct thisArg', () => {
    const unsorted = [1, 3, 2];
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const sorted = pipe.transform([].sort, undefined, unsorted);
    expect(sorted).toEqual([1, 2, 3]);
  });
});
