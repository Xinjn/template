import React, { useState } from "react";
import errorBoundary from "../../../../errorBoundary";
import styles from "./index.css"
// Editor
import CodeMirror from '@uiw/react-codemirror';
import { Store } from "../../../../../../store";


const ShemaPanel = (props) => {
  // 总数据
  const store = Store.useContainer();
  const { states, changeStates } = store;
  const { codeTree } = states
  
  const [shcema,setSchema] = useState(codeTree)

  const updateCode = (data) => {
    setSchema({...JSON.parse(data)})
  }

  const onSave = () => {
    changeStates({codeTree:{...codeTree,...shcema}})
  }

  return (
    <div className={styles.wrap}>
      <div>恭喜您发现「高级功能」，请谨慎操作！</div>

      <CodeMirror
        value={JSON.stringify(codeTree, null, '\t')} // 内容：解决json换行
        width="100%"
        options={{
          keyMap: 'sublime',
          styleActiveLine: true,    //高亮
          mode: {name: 'text/javascript', json: true},   //哪种类型的代码
        }}
        onChange={(data)=>updateCode(data)}
      />

      <div className={styles.option}>
        <button onClick ={onSave}>保存</button>
        <button>关闭</button>
      </div>
  </div>
  );
}

export default errorBoundary(ShemaPanel);
