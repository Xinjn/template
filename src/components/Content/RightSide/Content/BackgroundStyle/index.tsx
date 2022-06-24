import React, { useEffect, useState } from "react";
import errorBoundary from "../../../../errorBoundary";
import styles from "./index.css"

// 布局模式


const BackgroundStyle = (content) => {
  return (
        <div className={styles.background}>
          <div className={styles.backgroundHeader}>背景</div>
          <div>背景类型</div>
          <div>
            <button>颜色</button>
            <button>图片</button>
          </div>
            <input type="color" name="" id="" />
            <div>透明度</div>
            <input type="range" name="" id="" />
        </div>
  );
}

export default errorBoundary(BackgroundStyle);
