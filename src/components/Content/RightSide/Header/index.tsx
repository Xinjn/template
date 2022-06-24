import React, { useState } from "react";
import errorBoundary from "../../../errorBoundary";
import styles from "./index.css"

const Header = ({content}) => {

  return (
    <div className={styles.wrap}>
     <button className={styles.styleBtn}>样式</button>
     <button className={styles.optionBtn}>属性</button>
     <button className={styles.eventBtn}>事件</button>
     <button className={styles.dataBtn}>数据</button>
  </div>
  );
}

export default errorBoundary(Header);
