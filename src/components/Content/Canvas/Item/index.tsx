import React, { useRef } from "react";

import styles from "./index.css"
// Store
import { Store } from "../../../../../store";
// react-dnd
import { useDrop, useDrag } from 'react-dnd';
import { ItemTypes } from "../../../../../types";
import { getEmptyImage } from 'react-dnd-html5-backend';
import errorBoundary from "../../../errorBoundary";
import { traverse } from "../../../../../util";

const Item = (props) => {
  const {
    item,
    hoverId,
    appendChildrenNode,  // 追加子项
    replaceNode,  // 替换项
  } = props

  console.log('item',item);
  
  // 总数据
  const store = Store.useContainer();
  const { states, changeStates } = store;
  const { codeTree } = states

  const ref = useRef(null)

  const [{ canDrop, isOver }, drop] = useDrop(
    {
        accept: ItemTypes.NODE,
        collect: (monitor) => ({
          isOver: monitor.isOver({
            shallow: true,
          }),
          canDrop: monitor.canDrop(),
        }),
        drop: (item, monitor) => {
          if (monitor.didDrop()) {
            return;
          }

          const fromId = item.id
          const fromIndex = codeTree.children.findIndex(item => item.id === fromId)
          let fromNode = null
          traverse(codeTree, item => {
            if (item.id === fromId) {
              fromNode = item
            }
          })
          
          let hoverNode = null
          traverse(codeTree, item => {
            if (item.id === hoverId) {
              hoverNode = item
            }
          })

          // 相同ID立即返回
          if (fromId === hoverId)return 


          // 来自根节点
          if (fromIndex > -1) {
            console.log('来自根节点');
            
            
            if (!hoverNode?.children && !hoverNode.parentId) { 
               // 替换项
              replaceNode(fromId, hoverId)
            } else { 
              // 追加子项
              appendChildrenNode(fromId,hoverId)
            }

          } else if (hoverNode.parentId === fromNode.parentId) {
            console.log('来自其他节点',hoverNode.parentId,fromNode.parentId);
            return console.log('在子节点中不拖拽')
      
          } else {
            console.log('不存在');
             // 追加子项
              appendChildrenNode(fromId,hoverId)
          }
         
        },
    }
  )

  const [{ isDragging }, drag,dragPreview] = useDrag({
    type: ItemTypes.NODE,
    item: () => {
      const data = {
        componentName:item?.componentName,
        props:item?.props,
        id:item.id
      }  
      // 适配children属性
      item?.children ? data['children'] = item.children : null
      console.log('画板拖拽信息',data);
      return data
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  })
  
  // 隐藏拖拽默认预览图
  dragPreview(getEmptyImage())
  drag(drop(ref));


  const handlerChoose = (e) => {
    // 阻止捕获和冒泡阶段中当前事件的进一步传播
    e.stopPropagation()
    changeStates({currentId:item.id})
  }

  const render = () => {
    return (
      <>
         {item?.componentName}
        {item.children && item?.children.map((item, index) => {
          
           return (
             <Item 
            key={index} 
            item={item} 
            hoverId={item.id} // 获取hover项的index
            replaceNode={replaceNode}
            appendChildrenNode={appendChildrenNode}  // 追加子项
            />
           )
         })}
        {isOver && canDrop ? (
          <div className={styles.line}/>
        ) : null}
      </>
    )
  }

  return ( 
      <div className={`${styles.wrap}`} ref={ref} onClick={handlerChoose} data-className={item?.props?.className}>
        {render()}
      </div>
  );
}

export default errorBoundary(Item);
