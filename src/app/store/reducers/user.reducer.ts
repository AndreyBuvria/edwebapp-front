import { createReducer, on } from '@ngrx/store';
import * as UserActions from '../actions/user.actions';
import { UserState } from '../states';

const initialState: UserState = {
  user: null
};

export const userReducer = createReducer(
  initialState,
  on(UserActions.setUser, (state, { user }) => ({
    ...state,
    user: user,
  })),
  on(UserActions.clearUser, (state) => ({
    ...state,
    user: null
  })),
);
