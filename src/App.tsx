import React from 'react';
import './styles/index.css';
import HomePage from './components/HomePage';
import SignUpPage from './components/SignUpPage';
import SignInPage from './components/SignInPage'
import SamplesPage from './components/SamplesPage'
import MyTracksPage from './components/MyTracksPage'
import { HashRouter, Route, Switch, Link } from "react-router-dom";


function App() {
  return (
      <div className="App">
          <HashRouter basename='/'>
             <Switch>
                <Route exact path="/" component={HomePage} /> 
                <Route path="/signup" component={SignUpPage} /> 
                <Route path="/login" component={SignInPage} /> 
                <Route path="/samples" component={SamplesPage} />
                <Route path="/mytracks" component={MyTracksPage} />
              </Switch>  
         </HashRouter>
      </div>
  );
}



export default App;
