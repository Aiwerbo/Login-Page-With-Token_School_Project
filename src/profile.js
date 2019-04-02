import React, { PureComponent } from 'react';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import { Redirect } from "react-router-dom";
import {Helmet} from "react-helmet";
import {token$} from './store.js';
import { updateToken } from './store.js'
import './App.css';
const API_ROOT = 'http://ec2-13-53-32-89.eu-north-1.compute.amazonaws.com:3000';

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
      <input id="addTodoField" placeholder="Lägg till todo." ref="todoText" maxLength="100" type="text" onChange={this.todoText}></input><br/>
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

export default Profile;