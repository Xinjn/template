import React, { useState } from "react";
import errorBoundary from "../../errorBoundary";
import styles from "./index.css"
// Components
import Header from "./Header";
import Content from "./Content";

const RightSide = ({props}) => {
  return (
    <div className={styles.wrap}>
      <Header />
      <Content />
    </div>
  );
}

export default errorBoundary(RightSide);
