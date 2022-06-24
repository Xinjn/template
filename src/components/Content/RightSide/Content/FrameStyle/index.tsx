import React, { useEffect, useState } from "react";
import errorBoundary from "../../../../errorBoundary";
import styles from "./index.css"

const FrameStyle = (content) => {
  return (
        <div className={styles.frame}>
          <div className={styles.frameTitle}>边框</div>
            <div>圆角</div>
            <div>边框</div>
            <div>样式</div>
            <div>阴影</div>
        </div>
  );
}

export default errorBoundary(FrameStyle);
