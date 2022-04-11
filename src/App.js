// var hello = require("./hello.js");
// document.body.appendChild(hello());

import React from "react";
import ReactDOM from "react-dom";
import "../src/common/resetMobile.css";
// import "./app.less";
import Layout from "./layout";

ReactDOM.render(<Layout />, document.getElementById("root"));
