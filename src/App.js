// var hello = require("./hello.js");
// document.body.appendChild(hello());

import React from "react";
import ReactDOM from "react-dom";
import "../src/common/resetMobile.css";
// import "./App.less";
import Layout from "./layout";

// import Home from "./index";

// class App extends React.Component {
//   render() {
//     return <Home />;
//   }
// }

ReactDOM.render(<Layout />, document.getElementById("root"));
