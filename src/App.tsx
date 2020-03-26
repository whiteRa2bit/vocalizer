import React from 'react';
import './App.css';
import './index.css';
import MainPage from './components/MainPage';
import LoginPage from './components/LoginPage';
import { makeStyles } from '@material-ui/core/styles';
import { BrowserRouter, Route, Switch, Link } from "react-router-dom";



function App() {
  return (
      <div className="App">
          <BrowserRouter>
             <Switch>
                <Route exact path="/" component={MainPage} /> 
                <Route exact path="/login" component={LoginPage} /> 
             </Switch>  
         </BrowserRouter>
      </div>
  );
}



export default App;
