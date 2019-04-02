import React, { PureComponent } from 'react';
import { BrowserRouter as Router, Route} from "react-router-dom";
import './App.css';
import Login from './login.js'
import Profile from './profile.js';
import Register from './register.js'


class App extends PureComponent {
  render() {
    return (
      <Router>
        <div className="App">
        <Route exact path='/' component={Login}></Route>
        <Route path='/Register' component={Register}></Route>
        <Route path='/profile' component={Profile}></Route>
        </div>
      </Router>
    );
  }
}

export default App;

