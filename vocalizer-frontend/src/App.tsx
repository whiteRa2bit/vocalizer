import React from 'react';
import './styles/index.css';
import HomePage from './components/HomePage';
import SignUpPage from './components/SignUpPage';
import SignInPage from './components/SignInPage'
import SamplesPage from './components/SamplesPage'
import MyTracksPage from './components/MyTracksPage'
import { BrowserRouter, Route, Switch, Link } from "react-router-dom";


function App() {
  return (
      <div className="App">
          <BrowserRouter basename='/'>
             <Switch>
                <Route exact path="/" component={HomePage} /> 
                <Route exact path="/signup" component={SignUpPage} /> 
                <Route exact path="/login" component={SignInPage} /> 
                <Route exact path="/samples" component={SamplesPage} />
                <Route exact path="/mytracks" component={MyTracksPage} />
              </Switch>  
         </BrowserRouter>
      </div>
  );
}



export default App;
