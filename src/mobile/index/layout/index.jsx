import React from 'react';
import PropTypes from 'prop-types';
import errorBoundary from "@src/components/errorBoundary"
import styles from './index.css';
// import poster from "../../../assets/poster.png"
import Header from './Header';

const Layout = ({ content }) => {
    return (
        <div className={styles.wrap}>
            <Header />
            {/* <img src={poster} /> */}
        </div>
    );
};

Layout.propTypes = {
    content: PropTypes.object,
};

export default errorBoundary(Layout);
