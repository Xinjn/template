import React, { useEffect, useState } from "react";
import errorBoundary from "../../../../errorBoundary";
import styles from "./index.css"


const SelectStyle = (props) => {
  const {currentNode} = props
  
  return (
    <div className={styles.select}>
      <div className={styles.selectDom}>当前选中：{currentNode?.componentName}</div>

      <div className={styles.editorClassName}>
        <div>
          {currentNode?.props?.className && <span>{currentNode.props.className}</span>}
          <button>编辑</button>
        </div>

        <button>复制样式</button>
      </div>


      {
        currentNode?.props?.style &&
          Object.entries(currentNode.props.style).map((item, index) => {
            return (
              <div className={styles.editorStyle} key={index}>
                <span>{item[0]}</span>
                <span>：</span>
                <span>{item[1]}</span>
              </div>
            )
          })
      }

    </div>
  );
}


export default errorBoundary(SelectStyle);
