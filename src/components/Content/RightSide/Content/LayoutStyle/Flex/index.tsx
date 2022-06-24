import React, { useEffect, useState } from "react";
import errorBoundary from "../../../../../errorBoundary";
import styles from "./index.css"

// 主轴方向
const flexDirection = ['row','rowReverse','column','columnReverse']
// 主轴对齐
const justifyContent = ['flexStart','flexEnd','center','spaceBetween','spaceAround']
// 辅轴对齐
const alignItems = ['flexStart','flexEnd','center','baseline','stretch']
// 换行
const flexWrap = ['nowrap','wrap','column','wrapReverse']

const Flex = (props) => {

  
  return (
    <div className={styles.flex}>
        <div >
              <div>主轴方向</div>
              {
                  flexDirection.map((item, index) => {
                      return (
                          <button key={index}>
                              {item}
                          </button>
                      )
                  })
              }
        </div>
        <div>
              <div>主轴对齐</div>
              {
                  justifyContent.map((item, index) => {
                      return (
                          <button key={index}>
                              {item}
                          </button>
                      )
                  })
              }
        </div>
        <div>
              <div>辅轴对齐</div>
              {
                  alignItems.map((item, index) => {
                      return (
                          <button key={index}>
                              {item}
                          </button>
                      )
                  })
              }
        </div>
        <div>
              <div>换行</div>
              {
                  flexWrap.map((item, index) => {
                      return (
                          <button key={index}>
                              {item}
                          </button>
                      )
                  })
              }
        </div>
    </div>
              
  );
}

export default errorBoundary(Flex);
