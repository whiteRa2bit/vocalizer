import React from 'react';
import { Switch, Route } from 'react-router-dom';
    
import MainPage from './MainPage';
import LoginPage from './LoginPage';

const Main = () => {
  return (
    <Switch>
      <Route exact path='/' component={MainPage}></Route>
      <Route exact path='/login' component={LoginPage}></Route>
    </Switch>
  );
}

export default Main;