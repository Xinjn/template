import React from 'react';
import PropTypes from 'prop-types';
import styles from './index.css';
import poster from "../../../assets/poster.png"
import Header from '@src/Header/index';

const Layout = ({ content }) => {
    return (
        <div className={styles.wrap}>
            <div className={styles.header}>移动端</div>
            <img src={poster} />
            <Header />
        </div>
    );
};

Layout.propTypes = {
    content: PropTypes.object,
};

export default Layout;
// export default errorBoundary(Layout);
