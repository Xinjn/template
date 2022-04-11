import React from "react";
import styles from "./index.css"
import poster from "./images/poster.png"

function Home() {
  return <div>
    <h1 className={styles.wrap}>Hello React</h1>
    <img src={poster} />
  </div>;
}

export default Home;
