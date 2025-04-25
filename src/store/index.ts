import { configureStore } from '@reduxjs/toolkit';
import rootReducer, { RootState } from './reducers';

const store = configureStore({
  reducer: rootReducer
});

export type AppDispatch = typeof store.dispatch;
export { RootState };
export default store;
