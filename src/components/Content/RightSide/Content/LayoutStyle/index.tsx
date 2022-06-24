import React, { useEffect, useState } from "react";
import errorBoundary from "../../../../errorBoundary";
import styles from "./index.css"
// Components
import Flex from "./Flex";
import MarginAndPadding from "./MarginAndPadding";

// 布局模式
const layoutPattern = ['inline','flex','block','inlineBlock','none']

const LayoutStyle = (props) => {
  const {
    currentNode,
    onUpdateLayoutPattern,
    onUpateMarginPadding,
    onUpdateScale,
  } = props

  const [layoutPatternType,setLayoutPatternType] = useState('')
  
  const onLayoutPattern = (type) => {
    setLayoutPatternType(type)
    onUpdateLayoutPattern(type)
  }

  const onEnter = (e) => {
    if (e.keyCode === 13) {
      const value = e.target.value
      const name = e.target.name
      onUpdateScale(name,value)
  }

  }

  const onUpdate = () => { }

  return (
        <div className={styles.layout}>
          <div className={styles.layoutHeader}>布局</div>
          
          <div  className={styles.layoutPattern}>
        <div>
          布局模式：
          { currentNode?.props?.style['display'] && <span>{currentNode?.props?.style['display']}</span>}
        </div>
       
              {
                layoutPattern.map((item, index) => {
                  return (
                      <button className={styles.layoutPatternItem} key={index} onClick={()=>onLayoutPattern(item)}>{item}</button>
                  )
                })
              }
          </div>
            
          {
              layoutPatternType ===  'flex'
              ?
              <Flex />
              :
              <MarginAndPadding margin={'0 0 0 0'} padding={'0 0 0 0'} onUpdate={onUpateMarginPadding} />
          }
         

          <div  className={styles.layoutSize}>
                <div>宽度</div>
                <input type="text" placeholder={`${currentNode?.props?.style['width'] ? currentNode?.props?.style['width'] : '值'}`} onKeyDown={onEnter} name='width'/>
                <div>高度</div>
                <input type="text" placeholder={`${currentNode?.props?.style['height'] ? currentNode?.props?.style['height'] :'值'}`} onKeyDown={onEnter} name='height'/>
          </div>
        </div>
  );
}

export default errorBoundary(LayoutStyle);
