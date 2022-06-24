import React, { useEffect } from "react";

import styles from "./index.css"
// react-dnd
import { useDrag } from 'react-dnd'
import { getEmptyImage } from 'react-dnd-html5-backend';
import { ItemTypes } from "../../../../../../../types";
import errorBoundary from "../../../../../errorBoundary";

const Item = (props) => {
  const { item } =props
  // 拖拽
  const [
    { isDragging },//拖拽状态
    drag,// 当前拖拽节点
    dragPreview // 当前拖拽组件预览
    ] = useDrag({
      type:  ItemTypes.NODE,// 拖拽类型：需同一类型
      collect: (monitor) => ({ // 采集器
        isDragging: monitor.isDragging(),
      }),
      item: () => { // 设置拖拽数据
        const data = {
          componentName:item?.componentName,
          props:item?.props,
        }  
        // 适配children属性
        item?.children ? data['children'] = []: null
        console.log('组件拖拽信息',data);
        
        return data // 生成拖拽数据
      },
  })

  // 隐藏拖拽默认预览图
  dragPreview(getEmptyImage());

  return ( 
      <div className={styles.wrap} ref={drag}>
        {item?.componentName}
      </div> 
  );
}

export default errorBoundary(Item);
