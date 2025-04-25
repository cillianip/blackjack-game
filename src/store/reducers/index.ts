import { combineReducers } from 'redux';
import gameReducer from './gameReducer';
import settingsReducer from './settingsReducer';

const rootReducer = combineReducers({
  game: gameReducer,
  settings: settingsReducer
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;
