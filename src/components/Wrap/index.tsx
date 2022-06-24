import React,{ useEffect } from "react";
import errorBoundary from "../errorBoundary";
import styles from "./index.css"
// Store
import { Store } from "../../../store";
// DSL(react)
import DSL from "../../../Test";
import { traverse } from "../../../util";

const Wrap = (content) => {
  // 总数据
  const store = Store.useContainer();
  const { states, changeStates } = store;
  const { codeTree,currentId } = states
  
  const getCurrentNode = () => {
    const currentNode = null
    traverse(codeTree, item => {
      if (item.id === currentId) {
        console.log(item);
        
      }
    })
    // return currentNode
  }

  useEffect(() => {
    if (currentId) {
      getCurrentNode()
    }
  },[currentId])

  const randerStyle = () => {
    // 渲染根节点
    // randerRoot()
  }

  // const randerRoot = () => {
  //   const root = codeTree?.props?.style

  //   if (JSON.stringify(root) === '{}') {
  //     return;
  //   }

  //   // 获取Canvas
  //   const canvas = document.getElementById('canvas')
  //   // 设置根样式
  //   for (let [key, value] of Object.entries(root)) {
  //     canvas.style.cssText += `${key}: ${value}`
  //   } 

  // }
  
  useEffect(() => {
    if (codeTree) {
      // 渲染层
      randerStyle()
      
      // 出码
      const output = DSL(JSON.parse(JSON.stringify(codeTree)))
      console.log('出码：',output);
      const panelDisplay = output.panelDisplay[0]
      const panelValue = panelDisplay['panelValue']
      changeStates({output:panelValue})
    }
  },[codeTree])

  return (
    <div className={styles.wrap}>{content.children}</div>
  );
}

export default errorBoundary(Wrap);
 