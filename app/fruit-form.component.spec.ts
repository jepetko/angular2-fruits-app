import {  async,
          inject,
          addProviders,
          ComponentFixture,
          TestComponentBuilder } from '@angular/core/testing';
import { ConcreteType }   from '@angular/core/src/facade/lang';
import { disableDeprecatedForms, provideForms } from '@angular/forms';
import { FruitFormComponent, Model } from './fruit-form.component';

describe('FruitFormComponent', () => {

  let fixture: ComponentFixture<FruitFormComponent>;
  let component: FruitFormComponent;

  function doInject<T>(type: ConcreteType<T>, spec: (fixture: ComponentFixture<T>) => any) {
    return async(inject([TestComponentBuilder], (tcb: TestComponentBuilder) => {
      tcb.createAsync(type).then(setupFixture => spec(setupFixture));
    }));
  }

  function fillValue(selector: string, value: any) {
    let input: HTMLInputElement = <HTMLInputElement> fixture.nativeElement.querySelector(selector);
    input.value = value;
    let evt = new Event('input', {bubbles: true, cancelable: false});
    input.dispatchEvent(evt);
  }

  function patchChangeDetection() {
    fixture['detectChanges'] = function(checkNoChanges = true) {
      if (this.ngZone != null) {
        this.ngZone.runGuarded(() => { this._tick(checkNoChanges); });  // <---- runGuarded here for ability to catch the error
      } else {
        // Running without zone. Just do the change detection.
        this._tick(checkNoChanges);
      }
    };
  }

  beforeEach(() => addProviders([disableDeprecatedForms(), provideForms()]));

  beforeEach(doInject(FruitFormComponent, (theFixture: ComponentFixture<FruitFormComponent>) => {
      fixture = theFixture;

      // fixture.autoDetectChanges(false);
      component = fixture.componentInstance;
  }));

  it('shows the default budget value', () => {
    fixture.detectChanges();
    let budget: HTMLInputElement = <HTMLInputElement> fixture.nativeElement.querySelector('#budget');
    expect(budget.value).toEqual('' + Model.defaultBudget);
  });

  it('calculates the total price', () => {
    fixture.detectChanges();

    fillValue('#fruit0', 1); // apples
    fillValue('#fruit1', 2); // pears
    fillValue('#fruit2', 3); // oranges
    fixture.detectChanges();

    expect(component.model.getTotalPrice()).toBe(60);
  });

  it('calculates the difference', () => {
    fixture.detectChanges();

    fillValue('#budget', 200); // budget
    fillValue('#fruit0', 1); // apples
    fillValue('#fruit1', 2); // pears
    fillValue('#fruit2', 3); // oranges
    fixture.detectChanges();

    expect(component.model.getDiff()).toBe(140);
  });

  it('displays the difference value in red if the difference < 0', () => {
    fixture.detectChanges();

    fillValue('#fruit0', 100); // apples
    fixture.detectChanges();

    expect(component.model.getDiff()).toBe(-900);
    expect(fixture.nativeElement.querySelector('.row:last-child > div:last-child').innerText).toEqual('-900');
  });

  describe('change detection', () => {

    let myIt: any = it(`throws a "change detection error" if the fruit price > 100
                        and and the user does not provide a budget value`, () => {
      fixture.autoDetectChanges(true);

      patchChangeDetection();

      fillValue('#budget', 100);
      fillValue('#fruit0', 100); // apples

      let clearBudgetAndLeave = () => {
        let input: HTMLInputElement = <HTMLInputElement> fixture.nativeElement.querySelector('#budget');
        input.value = '';
        let evt = new Event('input', {bubbles: true, cancelable: false});
        input.dispatchEvent(evt);

        let evtBlur = new Event('blur', {bubbles: true, cancelable: false});
        input.dispatchEvent(evtBlur);
      };

      let failure = 'There should be the exception: Expression has changed after it was checked';
      let errHandler = (err: any) => {
        myIt.result.failedExpectations = [];
        if (err.error.message.indexOf('Expression has changed after it was checked') === -1) {
          fail(failure);
        }
      };
      let spy = jasmine.createSpy('errHandler', errHandler).and.callThrough();

      fixture.ngZone.onError.subscribe(spy);

      clearBudgetAndLeave();

      expect(spy.calls.count()).toBe(1, failure);
    });

  });
});
