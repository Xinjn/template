import React from "react";
import styles from "./index.css"
import RightSide from "./RightSide"
import LeftSide from "./LeftSide"
import Canvas from "./Canvas";
// react-dnd
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import errorBoundary from "../errorBoundary";

const Content = (props) => {
  return (
    <div className={styles.content}>
      <LeftSide />
        <DndProvider backend={HTML5Backend}>
          <Canvas />
        </DndProvider>
      <RightSide />
    </div>
  );
}

export default errorBoundary(Content);
