import { Component } from '@angular/core';
import { CORE_DIRECTIVES } from '@angular/common';
import { REACTIVE_FORM_DIRECTIVES } from '@angular/forms';
import { FruitFormComponent } from './fruit-form.component';

@Component({
    directives: [CORE_DIRECTIVES, REACTIVE_FORM_DIRECTIVES, FruitFormComponent],
    selector: 'my-app',
    template: '<fruit-form></fruit-form>'
})
export class AppComponent { }
