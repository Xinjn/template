import React, { useState } from "react";
import errorBoundary from "../errorBoundary";
import styles from "./index.css"
import { Store } from "../../../store";

const Header = () => {

    // 总数据
    const store = Store.useContainer();
    const { states, changeStates } = store;
    const { codeTree } = states
  
    const [shcema,setSchema] = useState(codeTree)
  
    const onSave = () => {
      changeStates({codeTree:{...codeTree,...shcema}})
    }
  
  return (
    <div className={styles.wrap}>
      
        <div className={styles.logo}>DesignToCode</div>
        <div className={styles.option}>
                <div className={styles.pcOrMobile}>
                  <button>PC端</button>
                  <button>移动端</button>
                </div>

        
                <div className={styles.outCode}>
                  <button onClick={onSave}>出码</button>
                </div>

                <div className={styles.saveCode}>
                  <button>保存</button>
                </div>
          </div>
 
  </div>
  );
}

export default errorBoundary(Header);
