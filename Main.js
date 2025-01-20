import React from 'react';
import {ImeiProvider} from './src/ImeiProvider';
import App from './App';

const Main = () => {
  return (
    <ImeiProvider>
      <App />
    </ImeiProvider>
  );
};

export default Main;
