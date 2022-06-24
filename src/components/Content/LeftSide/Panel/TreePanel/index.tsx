import React from "react";
import errorBoundary from "../../../../errorBoundary";
import styles from "./index.css"
import { Store } from "../../../../../../store";
import { useDrop } from 'react-dnd';
import { ItemTypes } from "../../../../../../types";
import CustomDragLayer from "./CustomDragLayer";

// Item
import Item from "./Item";


const DomTree = (props) => {
  // 总数据
  const store = Store.useContainer();
  const {
    states,
    appendNode,  // 添加新项
    appendChildrenNode,  // 追加子项
    replaceNode, // 替换项
    removeChildNode   // 移除子项
  } = store;

  const { codeTree } = states

  // 放置
  const [
    { 
      canDrop, // 是否放置中（进行中）
      isOver  // 是否进入目标放置区域
    },
    drop // 当前放置节点
  ] = useDrop({
    accept: ItemTypes.NODE, // 拖拽类型：需同一类型
    collect: (monitor) => ({ // 采集器
      // 测试悬停是仅发生在当前目标上还是嵌套目标上
      isOver: monitor.isOver({
        shallow: true,
      }),
      canDrop: monitor.canDrop(),
    }),
    drop:(item,monitor)=>{ // 放置
      // 当前目标直接返回
      const didDrop = monitor.didDrop(); 
      if (didDrop) {
        return;
      }

      console.log('画板放置信息', item);
      
      // 添加新项
      if (!item.id) {
        
        appendNode(item)
      } else {
        // 移出子项
        removeChildNode(item.id)
      }
    }
  },[])

  return ( 
    <div className={styles.wrap} >
      {/* 节点树 */}
      <div 
        className={styles.canvas} 
        ref={drop}
      >
        {
          codeTree?.children.map((item,index)=>{
            return (
                <Item 
                  key={index} 
                  item={item} 
                  hoverId={item.id} // 获取hover项的index
                  replaceNode={replaceNode}
                  appendChildrenNode={appendChildrenNode}  // 追加子项
                />
            )
          })
        }
        <CustomDragLayer />
      </div>
    </div>
);
}

export default errorBoundary(DomTree)
