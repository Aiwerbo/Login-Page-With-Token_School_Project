import React, { PureComponent } from 'react';
import axios from 'axios';
import { Link, Redirect } from "react-router-dom";
import {Helmet} from "react-helmet";
import { updateToken } from './store.js'
import './App.css';
const API_ROOT = 'http://ec2-13-53-32-89.eu-north-1.compute.amazonaws.com:3000';


class Login extends PureComponent{
  constructor(props){
    super(props);
    this.state = ({email: '', password: '', isLoggedIn: false, errorMessage: ''});

  }

componentDidMount(){
  this.source = axios.CancelToken.source();
}

componentWillUnmount(){
  if (this.source) {
    this.source.cancel();
  }

}
  

  onLogin = (e) => {
    
    e.preventDefault();

    axios.post(API_ROOT + '/auth', { email: this.state.email, password: this.state.password }, {headers: {"Content-Type": "application/json"}, cancelToken: this.source.token })
   
    .then((response) =>  {

      if(response.status === 200){
        const token = response.data.token;
      updateToken(token);
      this.setState({isLoggedIn: true})

      }
      
    
    })
    .catch(error => {
      if (axios.isCancel(error)) {
        return;
      }
      if(error.response && error.response.status >= 500){
        this.setState({errorMessage: 'Servern du loggar in på verkar inte så snäll mot dig just nu. Försök logga in igen lite senare, '});
      
      }
      if(error.response && error.response.status === 401){
        this.setState({errorMessage: 'Tråkigt nog så verkar det som att du har fyllt i fel inloggningsuppgifter. Testa igen vet jag!'});
       
      }
      if(error.response && error.response.status === 400){
        this.setState({errorMessage: 'Tråkigt nog så verkar det som att du har fyllt i fel inloggningsuppgifter. Testa igen vet jag!'})
      }
    })
    
  }

  onChangeEmail = (e) => {
    this.setState({email: e.target.value, errorMessage: ''})
  }
  onChangePassword = (e) => {
    this.setState({password: e.target.value, errorMessage: ''})
  }

  render(){

    if(this.state.isLoggedIn){
      return <Redirect to="/profile" />
    }

    return (
      <>
      <Helmet><title>Login</title></Helmet>
      <div className="mainContainer">
      <div className="loginContainer">
      <h3 className="logInHeader">Logga in till din personliga Todo-lista</h3>
        <form onSubmit={this.onLogin}> 
          <input className="inputField" type="email" placeholder="användarnamn" onChange={this.onChangeEmail}></input>
          <br/>
          <input className="inputField" type="password" placeholder="lösenord" onChange={this.onChangePassword}></input><br/>
          <input className="button" type="submit" value="Logga in"></input>
        </form>
        <label id="notRegistered">Inte registrerad?</label>{' '}<Link id="registerNewLink" to="/Register">Registrera nytt konto!</Link>
        <p className="errorMessage">{this.state.errorMessage}</p>
        </div>
        </div>
      </>
    )
    
  }
}

export default Login;