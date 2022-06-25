import React from 'react';
import PropTypes from 'prop-types';
import styles from './index.css';
import errorBoundary from "@src/components/errorBoundary"

const Layout = ({ content }) => {
    return (
        <div className={styles.layout_test}>
           <span>hello ifeng</span>
        </div>
    );
};

Layout.propTypes = {
    content: PropTypes.object,
};

export default errorBoundary(Layout);
