import { createAction, props } from "@ngrx/store";
import { UserState } from "../states";

export const clearUser = createAction(
  '[User] Clear user'
);

export const setUser = createAction(
  '[User] Set user',
  props<UserState>()
);

export const invokeFetchingUser = createAction(
  '[User API] Invoke fetching user by ID',
  props<{ id: number }>()
);

