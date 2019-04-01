import React, { PureComponent } from 'react';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import { BrowserRouter as Router, Route, Link, Redirect } from "react-router-dom";
import {Helmet} from "react-helmet";
import {token$} from './store.js';
import { updateToken } from './store.js'
import './App.css';
const API_ROOT = 'http://ec2-13-53-32-89.eu-north-1.compute.amazonaws.com:3000';




class Login extends PureComponent{
  constructor(props){
    super(props);
    this.state = ({email: '', password: '', isLoggedIn: false, errorMessage: ''});
    this.onLogin = this.onLogin.bind(this); 
    this.onChangeEmail = this.onChangeEmail.bind(this);
    this.onChangePassword = this.onChangePassword.bind(this);
  }

componentDidMount(){
  this.source = axios.CancelToken.source();
}

componentWillUnmount(){
  if (this.source) {
    this.source.cancel();
  }

}
  

  onLogin(e){
    
    e.preventDefault();

    axios.post(API_ROOT + '/auth', { email: this.state.email, password: this.state.password }, {headers: {}, cancelToken: this.source.token })

    .then((response) =>  {
     

      const token = response.data.token;
      updateToken(token);
      this.setState({isLoggedIn: true})
    
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

  onChangeEmail(e){
    this.setState({email: e.target.value, errorMessage: ''})
  }
  onChangePassword(e){
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

class Profile extends PureComponent {

  constructor(props){
    super(props);
    this.state = {todos: [], email: null, newTodo: '', token: token$.value, errorMessage: ''}
    this.logOut = this.logOut.bind(this);
    this.addTodo = this.addTodo.bind(this);
    this.todoText =  this.todoText.bind(this)
    this.renderList = this.renderList.bind(this)
    this.deleteTodo = this.deleteTodo.bind(this);
  }

  componentDidMount(){

    this.source = axios.CancelToken.source();

    this.subscription = token$.subscribe((token) => {
      this.setState({token: token})
    });

    if(!this.state.token){
      return <Redirect to='/' />
    }

    const decoded = jwt.decode(this.state.token);
    console.log(decoded)
    this.setState({email: decoded.email});

    axios.get(API_ROOT + '/todos', {
    headers: {
    Authorization: 'Bearer ' + token$.value}, cancelToken: this.source.token})
    .then((response) => {
      if(response.status === 200){
        const data = response.data.todos;
        this.setState({todos: data})
      }
      console.log(response)
    })
    .catch(error =>{
      if (axios.isCancel(error)) {
        return;
      }
      if(error.response && error.response.status){
        this.setState({errorMessage: 'Det verkar inte gå att hämta din lista, Logga ut och logga in igen.'});
        
      }

    })

  }

  renderList(data){
    console.log(data)
    
    return(

      
      
      <li key={data.id} className="listContent">{data.content}<button className="listButton" data-id={data.id} onClick={this.deleteTodo}>x</button></li>
      
    
    )
  }

  componentWillUnmount() {
    this.subscription.unsubscribe();

    if (this.source) {
      this.source.cancel();
    }
  }

  logOut(){
    //this.setState({isLoggedIn: false});
     updateToken(null);
     
   }
   addTodo(e){
    axios.post(API_ROOT + '/todos', {content: this.state.newTodo}, {headers: {
      Authorization: 'Bearer ' + token$.value}, cancelToken: this.source.token})
      .then(response => {
        this.setState({newTodo: ''})
        if(response.status === 201){
          this.refs.todoText.value = '';

          axios.get(API_ROOT + '/todos', {
            headers: {
            Authorization: 'Bearer ' + token$.value}, cancelToken: this.source.token})
        .then((response) => {
              if(response.status === 200){
                const data = response.data.todos;
                this.setState({todos: data})
              }
              console.log(response)
            })
          
        }
      
      })
      .catch(error =>{
        if (axios.isCancel(error)) {
          return;
        }
        if(error.response && error.response.status === 400){
          this.setState({errorMessage: 'Fyll i en todo i listan.'});
          
        }
        if(error.response && error.response.status === 401){
          this.setState({errorMessage: 'Du har blivit utloggad på grund av inaktivitet. Logga ut och logga in igen.'});
          
        }
      });


   }

   deleteTodo(e){

    const data = this.state.todos;

    const id = e.target.dataset.id;
    axios.delete(API_ROOT + '/todos/' + id, {headers: {Authorization: 'Bearer ' + token$.value}, })
    .then(response => {
      console.log(response)
      if(response.status === 204){
        const index = data.findIndex(x => x.id === id);
        if(index >= 0){
          const newData = [...data.slice(0, index), ...data.slice(index + 1)];
          this.setState({todos: newData})
        }
      }
    })
    .catch(error =>{
      if (axios.isCancel(error)) {
        return;
      }
      if(error.response && error.response.status){
        this.setState({errorMessage: 'Något fel blev inte rätt. Pröva att ta bort en post från din lista igen.'})
      }
    })
    
   }

   todoText(e){
    this.setState({newTodo: e.target.value, errorMessage: ''})
   }

  render(){
    const listData = this.state.todos.map(this.renderList).reverse();

    if(this.state.token === null){
   
      return <Redirect to="/" />
    } 


    console.log(this.state.todos)
    return(
      <>
      <Helmet><title>{'Todo for: ' + this.state.email} </title></Helmet>
      <div className="mainContainer">
      <div className="mainProfileContainer">
      
      <div id="profileContainer">
      
      <h2 id="todoHeader">Min Todo-lista</h2>
      
      <label id="loggedInText">Inloggad som:</label><br/>
      <label id="loggedIn">{this.state.email}</label>
      <button id="signOutButton" onClick={this.logOut}>Logga ut</button><br/>
      <input id="addTodoField" placeholder="Lägg till todo." ref="todoText" type="text" onChange={this.todoText}></input><br/>
      <button id="addButton" onClick={this.addTodo}>Lägg till todo</button>
      <label id="errorM">{this.state.errorMessage}</label>
      </div>
      
      <div id="contentContainer">
      
      <ul>{listData}</ul>
      </div>
      </div>
      </div>
      </>
    )
  }
}

class Register extends PureComponent {

 constructor(props){
   super(props);
   this.state = {email: '', password: '', isRegistered: false, errorMessage: '', registeredMessage: ''}
   this.newAccount = this.newAccount.bind(this)
   this.newEmail = this.newEmail.bind(this);
   this.newPassword = this.newPassword.bind(this);
 }

 newAccount(e){
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

 newEmail(e){
  this.setState({email: e.target.value, errorMessage: ''});
 }

 newPassword(e){
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

