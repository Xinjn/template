import React, { useEffect, useState } from "react";
import errorBoundary from "../../../../errorBoundary";
import styles from "./index.css"

// 浮动方向
const floatDirection = ['不浮动','左浮动','右浮动']
// 清楚浮动
const clearFloat = ['不清除','左清除','右清除','左右清除']

const LocationStyle = (content) => {
  return (
        <div className={styles.location}>
          <div className={styles.locationTitle}>定位</div>
      <div>定位类型</div>
      <select name="styleType" id="styleType">
        <option value="Static">无定位Static</option>
        <option value="Relative">相对定位Relative</option>
        <option value="Absolute">绝对定位Absolute</option>
        <option value="Fixed">固定定位Fixed</option>
        <option value="sticky">粘性定位sticky</option>
      </select>
            <div>层叠顺序</div>
            <input type="number" />
            <div>浮动方向</div>
            {
                floatDirection.map((item, index) => {
                  return (
                      <button className={styles.floatDirectionItem} key={index}>{item}</button>
                  )
                })
              }
              <div>清楚浮动</div>
              {
                clearFloat.map((item, index) => {
                  return (
                      <button className={styles.clearFloatItem} key={index}>{item}</button>
                  )
                })
              }
        </div>
  );
}

export default errorBoundary(LocationStyle);
