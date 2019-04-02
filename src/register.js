import React, { PureComponent } from 'react';
import axios from 'axios';
import {Link} from "react-router-dom";
import {Helmet} from "react-helmet";
import './App.css';
const API_ROOT = 'http://ec2-13-53-32-89.eu-north-1.compute.amazonaws.com:3000';

class Register extends PureComponent {

  constructor(props){
    super(props);
    this.state = {email: '', password: '', isRegistered: false, errorMessage: '', registeredMessage: ''}

  }
 
  newAccount = (e) => {
    e.preventDefault();
   axios.post(API_ROOT + '/register', { email: this.state.email, password: this.state.password })
     .then((response) =>  {
       console.log(response)
       if(response.status === 201){
         this.setState({isRegistered: true, registeredMessage: 'Registrering klar. Logga in.'})
       }
     })
     .catch(error =>{
       if (axios.isCancel(error)) {
         return;
       }
       if(error.response && error.response.status >= 500){
         this.setState({errorMessage: 'Servern vill inte registrera dig, Pröva igen.'});
         
       }
       if(error.response && error.response.status === 400){
         this.setState({errorMessage: 'Det gick inte att skapa kontot. Pröva igen'});
         
       }
  })
 }
 componentDidMount(){
   this.source = axios.CancelToken.source();
 }
 componentWillUnmount(){
   if (this.source) {
     this.source.cancel();
   }
   this.setState({isRegistered: false})
 }
 
  newEmail = (e) => {
   this.setState({email: e.target.value, errorMessage: ''});
  }
 
  newPassword = (e) => {
    this.setState({password: e.target.value, errorMessage: ''});
  }
 
  render(){
   
   if(this.state.isRegistered === true){
     
     //return <Redirect to="/" />
   }
 
    return(
      <>
      <Helmet><title>Register new account</title></Helmet>
      <div className="mainContainer">
      <div className="loginContainer">
      <h3 className="logInHeader">Registrera ny användare</h3>
      <form onSubmit={this.newAccount}>
       <input className="inputField" onChange={this.newEmail} type="email" placeholder="användarnamn"></input>
       <input className="inputField" onChange={this.newPassword} type="password" placeholder="lösenord"></input>
       <input className="button" type="submit" value="Registrera"></input>
       </form>
       <Link id="loginPage" to="/">Login page</Link>
       <p className="errorMessage">{this.state.errorMessage}</p>
       <Link to="/" className="registerDone">{this.state.registeredMessage}</Link>
       </div>
       </div>
      </>
    )
  }
 
 }

 export default Register;