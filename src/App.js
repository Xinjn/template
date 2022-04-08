// var hello = require("./hello.js");

// document.body.appendChild(hello());

import React from "react";
import ReactDOM from "react-dom";

import "./index.less";
import Home from "./index.jsx";

class App extends React.Component {
  render() {
    return <Home />;
  }
}

ReactDOM.render(<App />, document.getElementById("content"));
