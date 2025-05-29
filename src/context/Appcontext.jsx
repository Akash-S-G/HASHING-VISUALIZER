import React, { createContext, useContext, useReducer } from 'react';

const AppContext = createContext();
export const useAppContext = () => useContext(AppContext);

const initialState = {
  table: [],
  method: 'chaining',
  actions: [],   // animation steps
  currentStep: 0,
  speed: 500,
  stats: { collisions: 0, loadFactor: 0 },
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_METHOD': return { ...state, method: action.payload };
    case 'RESET': return initialState;
    case 'SET_TABLE': return { ...state, table: action.payload };
    case 'ADD_ACTION': return { ...state, actions: [...state.actions, action.payload] };
    case 'NEXT_STEP': return { ...state, currentStep: state.currentStep + 1 };
    // Add more as needed
    default: return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}