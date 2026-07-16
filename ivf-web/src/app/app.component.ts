import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { Store } from '@ngrx/store';
import { LoaderComponent } from './shared/components/loader/loader.component';
import { selectGlobalLoading, selectLoadingMessage } from './store/ui/ui.selectors';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, LoaderComponent, AsyncPipe],
  template: `
    <app-loader [visible]="(loading$ | async) ?? false" [message]="(message$ | async) ?? 'Please wait...'"></app-loader>
    <router-outlet></router-outlet>
  `,
})
export class AppComponent {
  private store = inject(Store);
  loading$ = this.store.select(selectGlobalLoading);
  message$ = this.store.select(selectLoadingMessage);
}
