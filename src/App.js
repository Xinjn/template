// var hello = require("./hello.js");

// document.body.appendChild(hello());

import React from "react";
import ReactDOM from "react-dom";

import "./App.less";
import Home from "./index";

class App extends React.Component {
  render() {
    return <Home />;
  }
}

ReactDOM.render(<App />, document.getElementById("content"));
