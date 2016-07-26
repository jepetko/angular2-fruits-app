import { CORE_DIRECTIVES } from '@angular/common';
import { REACTIVE_FORM_DIRECTIVES } from '@angular/forms';
import { FormBuilder, Validators, FormGroup, AbstractControl } from '@angular/forms';
import { Component } from '@angular/core';

export class Model {
  static defaultBudget: number = 100;
  pricePerFruit: number = 10;
  budget: number = Model.defaultBudget;
  fruits: string[] = ['apple', 'pear', 'orange'];
  selectedFruits: {[fruit: string]: number} = {};
  getTotalPrice(): number {
    let count = 0;
    for (let fruit in this.selectedFruits) {
      if (fruit) { // satisfy tslint
        count += this.selectedFruits[fruit];
      }
    }
    return count * this.pricePerFruit;
  }
  getDiff(): number {
    return this.budget - this.getTotalPrice();
  }
}

class CustomValidators {

  // buggy validation method
  static doesBudgetCoverTheFruits(getModelFn: () => Model): (group: AbstractControl) => {[key: string]: boolean} {
      let model = getModelFn();
      return (group: FormGroup) => {
      let budget: number = parseInt('' + model.budget, 10);
      if (budget < model.getTotalPrice()) {
        return {doesBudgetCoverTheFruits: true};
      }
    };
  }

/*
  static doesBudgetCoverTheFruits(getModelFn: () => Model): (group: AbstractControl) => {[key: string]: boolean} {
    let model = getModelFn();
    return (group: FormGroup) => {
      let err: {[key: string]: boolean} = {doesBudgetCoverTheFruits: true};
      let budget: number = parseInt('' + model.budget, 10);
      if (isNaN(budget)) {
        return err;
      }
      return (budget < model.getTotalPrice()) ? err : undefined;
    };
  }
*/
}

@Component({
  directives: [CORE_DIRECTIVES, REACTIVE_FORM_DIRECTIVES],
  selector: 'fruit-form',
  styles: [`.row > div:last-child {
    text-align: right;
  }
  .red {
    color: red;
  }`],
  template: `<div class="container">
      <div class="error" *ngIf="_hasBudgetCoverageError()">
        Your budget does not cover the selected fruits.
      </div>
      <form [formGroup]="form" role="form">
        <div class="form-group">
          <label for="budget">
            Budget:
          </label>
          <input  id="budget" type="number" class="form-control"
                  [(ngModel)]="model.budget" formControlName="budget" (blur)="setDefaultBudget()" autofocus>
        </div>
        <hr>
        <div class="form-group">
          Add some fruits. The price per fruit is {{model.pricePerFruit}}.
        </div>
        <div class="form-group" *ngFor="let fruit of model.fruits; let idx = index;">
          <label [attr.for]="'fruit' + idx">
            {{fruit}}
          </label>
          <input  id="fruit{{idx}}" type="number" class="form-control" [formControl]="form.find('fruit' + idx)"
                  [ngModel]="model.selectedFruits[fruit]" (ngModelChange)="updateFruit(fruit, $event)">
        </div>
        <hr>
        <div class="panel panel-default">
          <div class="panel-body">
            <div class="row">
              <div class="col-md-8 col-xs-8">Budget</div>
              <div class="col-md-4 col-xs-4">{{model.budget}}</div>
            </div>
            <div class="row">
              <div class="col-md-8 col-xs-8">Total price</div>
              <div class="col-md-4 col-xs-4">{{model.getTotalPrice()}}</div>
            </div>
            <hr>
            <div class="row">
              <div class="col-md-8 col-xs-8">Difference</div>
              <div class="col-md-4 col-xs-4" [ngClass]="{'red': model.getDiff() < 0}">{{model.getDiff()}}</div>
            </div>
          </div>
        </div>
      </form>
    </div>`
})
export class FruitFormComponent {

  form: FormGroup;
  model: Model;

  constructor(private _fb: FormBuilder) {
    this.model = new Model();
    this.form = this._fb.group({
        budget: ['', Validators.required],
        fruit0: [],
        fruit1: [],
        fruit2: []
      },
      {
        validator: CustomValidators.doesBudgetCoverTheFruits(() => this.model)
      });
  }

  updateFruit(fruit: string, value: number) {
    this.model.selectedFruits[fruit] = value;
  }

  setDefaultBudget() {
    if (!this.model.budget) {
      this.model.budget = Model.defaultBudget;
    }
  }

  /* tslint:disable */
  private _hasBudgetCoverageError(): boolean {
    return this.form.hasError('doesBudgetCoverTheFruits');
  }
}
