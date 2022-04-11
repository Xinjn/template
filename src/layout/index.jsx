import React from 'react';
import styles from "./index.css"
import Home from "./home"

const Layout = ({ content }) => {
    return (
        <div className={styles.wrap}>
            <Home />
        </div>
    );
};



export default Layout;
