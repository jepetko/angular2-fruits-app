import { bootstrap }    from '@angular/platform-browser-dynamic';
import { disableDeprecatedForms, provideForms } from '@angular/forms';
import { FORM_PROVIDERS } from '@angular/common';

import { AppComponent } from './app.component';

bootstrap(AppComponent, [
  FORM_PROVIDERS,
  disableDeprecatedForms(),
  provideForms()
]);
