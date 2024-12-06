import React from 'react';
import logo from './logo.svg';
import './App.css';
import {BrowserRouter, Routes, Route} from "react-router-dom";
import SignIn from "./user/login/SignIn";
import SignUp from "./user/register/SignUp";
import WelcomePage from "./welcome/WelcomePage";
import SpecificListPage from "./list/List";
import Impressum from "./standard/Impressum";
import About from "./standard/About";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
            <Route index element={<WelcomePage/>}/>
            <Route path="/login" element={<SignIn/>}/>
            <Route path="/register" element={<SignUp/>}/>
            <Route path="/list/:listId" element={<SpecificListPage/>}/>
            <Route path="/impressum" element={<Impressum/>}/>
            <Route path="/about" element={<About/>}/>
            <Route path="*" element={<div/>}/>
        </Routes>
    </BrowserRouter>
    </div>
  );
}

export default App;
