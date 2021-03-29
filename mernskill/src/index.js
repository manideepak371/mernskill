import React from 'react';
import ReactDOM from 'react-dom';
import {Page} from './MainPage'
import reportWebVitals from './reportWebVitals';
//import {Childe} from './Append.js'

ReactDOM.render(
  <Page/>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

