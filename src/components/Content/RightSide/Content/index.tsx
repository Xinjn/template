import React, { useEffect, useState } from "react";
import errorBoundary from "../../../errorBoundary";
import styles from "./index.css"
// Store
import { Store } from "../../../../../store";
// components
import LayoutStyle from "./LayoutStyle";
import LocationStyle from "./LocationStyle";
import BackgroundStyle from "./BackgroundStyle";
import FrameStyle from "./FrameStyle";
import SelectStyle from "./SelectStyle";
import { traverse } from "../../../../../util";

const Content = ({props}) => {
    // 总数据
    const store = Store.useContainer();
    const { states, changeStates } = store;
    const { codeTree, currentId } = states

    const [currentNode, setCurrentNode] = useState(null)
  
    // 获取目标节点
    const getCurrentNode = () => {
      traverse(codeTree, item => {
        if (item.id === currentId) {
          setCurrentNode(item)
          
          return false
        }
        return true
      })
    }
  
    useEffect(() => {
      if (currentId) {
        getCurrentNode()
      }
    }, [currentId])
    
    // 更新数据
    useEffect(() => {
      getCurrentNode()
    },[codeTree])

    // 更新布局
    const onUpdateLayoutPattern = (value) => {
      if (!currentNode) return alert('未选中节点')
      
      // 改变JSON
      if (value) {
        const codeTree2 = codeTree
        codeTree2.props.style[`display`] = value;
        changeStates({codeTree:{...codeTree,...codeTree2}})
      }
    }
  
    //更新尺寸
    const onUpdateScale = (name, value) => {
      if (!currentNode) return alert('未选中节点')
      
      // 改变shema
      if (name && value) {
        const codeTree2 = codeTree
        traverse(codeTree2, item => {
          if (item.id === currentId) {
            item.props.style[`${name}`] = value;

            item?.rect[`${name}`] ? item.rect[`${name}`] = parseInt(value,10) : null

          }
        })
          changeStates({codeTree:{...codeTree,...codeTree2}})
      }
    }


  return (
     <div className={styles.wrap}> 
        <SelectStyle currentNode={currentNode} />
        <LayoutStyle currentNode={currentNode} onUpdateScale={onUpdateScale} onUpdateLayoutPattern={onUpdateLayoutPattern}/>
        <LocationStyle />
        <BackgroundStyle />
        <FrameStyle />
    </div>
  );
}

export default errorBoundary(Content);
