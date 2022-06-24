import React from 'react';
import PropTypes from 'prop-types';
import styles from './index.css';
// import errorBoundary from "../../../components/errorBoundary"
import poster from "../../../assets/poster.png"

const Layout = ({ content }) => {
    return (
        <div className={styles.wrap}>
            <div className={styles.header}>移动1端</div>
            {/* <img src={poster} /> */}
        </div>
    );
};

Layout.propTypes = {
    content: PropTypes.object,
};

export default Layout;
// export default errorBoundary(Layout);
