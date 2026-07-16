import { Component, OnDestroy, OnInit, inject } from '@angular/core';

import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { AsyncPipe } from '@angular/common';

import { Store } from '@ngrx/store';

import { AuthActions } from '../../../store/auth/auth.actions';

import { selectAuthError, selectAuthLoading } from '../../../store/auth/auth.selectors';



const REMEMBER_KEY = 'ivf_craft_remember_username';



@Component({

  selector: 'app-login',

  standalone: true,

  imports: [ReactiveFormsModule, AsyncPipe],

  templateUrl: './login.component.html',

  styleUrl: './login.component.scss',

})

export class LoginComponent implements OnInit, OnDestroy {

  private store = inject(Store);

  private fb = inject(FormBuilder);



  loading$ = this.store.select(selectAuthLoading);

  error$ = this.store.select(selectAuthError);



  showPassword = false;



  form = this.fb.group({

    username: ['', Validators.required],

    password: ['', Validators.required],

  });



  ngOnInit(): void {

    document.documentElement.style.overflow = 'hidden';

    document.body.style.overflow = 'hidden';

    const saved = localStorage.getItem(REMEMBER_KEY);

    if (saved) {

      this.form.patchValue({ username: saved });

    }

  }



  ngOnDestroy(): void {

    document.documentElement.style.overflow = '';

    document.body.style.overflow = '';

  }



  togglePassword(): void {

    this.showPassword = !this.showPassword;

  }



  clearError(): void {

    this.store.dispatch(AuthActions.clearError());

  }



  submit(): void {

    if (this.form.invalid) {

      this.form.markAllAsTouched();

      return;

    }

    const { username, password } = this.form.getRawValue();

    if (username) {

      localStorage.setItem(REMEMBER_KEY, username);

    }

    this.store.dispatch(AuthActions.login({ username: username!, password: password! }));

  }

}

