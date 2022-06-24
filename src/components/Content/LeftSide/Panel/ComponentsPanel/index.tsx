import React, { useState } from "react";
import errorBoundary from "../../../../errorBoundary";
import styles from "./index.css"
// Store
import { Store } from "../../../../../../store";
// Item
import Item from "./Item";
// 组件库JSON
import component from "./Schema";


const ComponentsPanel = (props) => {

  return ( 
      <div className={styles.wrap} >
        {component.map((item, index) => {
          return (
            <Item 
                key={index}
                item={item}
            />
          )
        })}
      </div>
  );
}

export default errorBoundary(ComponentsPanel);
