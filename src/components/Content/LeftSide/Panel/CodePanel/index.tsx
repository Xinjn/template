import React, { useEffect, useState } from "react";

import styles from "./index.css"
// Editor
import CodeMirror from '@uiw/react-codemirror';
import { Store } from "../../../../../../store";
import errorBoundary from "../../../../errorBoundary";


const CodePanel = (props) => {
  // 总数据
  const store = Store.useContainer();
  const { states, changeStates } = store;
  const { output } = states

  const [code, setCode] = useState(output);

  const downLoad = () => {
    // 下载的文件名
    var filename = 'App.jsx';
    var file = new File([code], filename, {
      type: 'text/javascript',
    });
    // 创建隐藏的可下载链接
    var eleLink = document.createElement('a');
    eleLink.download = filename;
    eleLink.style.display = 'none';
    // 下载内容转变成blob地址
    eleLink.href = URL.createObjectURL(file);
    // 触发点击
    document.body.appendChild(eleLink);
    eleLink.click();
    // 然后移除
    document.body.removeChild(eleLink);
  };

  
  return (
    <div className={styles.wrap}>
      <div>代码预览</div>
        <CodeMirror
          value={output}
          width="300px"
          height="100%"
          options={{
            keyMap: 'sublime',
            mode: 'jsx',
          }}
      />
      <div className={styles.downLoad}>
        <button>复制</button>
        <button onClick={downLoad}>下载</button>
      </div>
    </div>
 
   
  );
}

export default errorBoundary(CodePanel);
