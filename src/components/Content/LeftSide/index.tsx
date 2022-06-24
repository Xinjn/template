import React, { useEffect, useState } from "react";
import errorBoundary from "../../errorBoundary";
import styles from "./index.css"
import { Store } from "../../../../store" 
import SetPanel from "./Panel";
// 面板JSON
import Menus from "./Schema/index.jsx"

const LeftSide = (props) => {
  // 总数据
  const store = Store.useContainer();
  const { states, changeStates } = store;

  return (
    <div className={styles.wrap}>
      <div className={styles.aside}>
        {
          Menus && Menus.length >0 && Menus.map((item,index) => {
            return (
              <div key={index} className={styles.item}>
                <button className={styles.menusBtn}>{item?.name}</button>
              </div>
            )
          })
        }
      </div>
      <SetPanel />
  </div>
  );
}

export default errorBoundary(LeftSide);
