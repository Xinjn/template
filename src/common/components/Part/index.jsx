/**
 * 通栏组件
 * 文档见：http://sys-manager.shank.ifeng.com/doc/custom/pages/react/howToUse.html#%E9%80%9A%E6%A0%8F
 *
 * @param {Object} data 通栏碎片的内容
 *
 * */
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import errorBoundary from '@ifeng/errorBoundary';
import styles from './index.css';

const isPreview = /\/visualediting/g.test(window.location);
const Part = (props) => {
    const { children, data } = props;
    const [ isShow, setIsShow ] = useState(true);
    const [ trueChildren, setTrueChildren ] = useState([]);
    const [ visualChildren, setVisualChildren ] = useState([]);

    useEffect(() => {
        const trueChildren = [];
        const visualChildren = [];

        for (const item of data) {
            const dom = children.find(a => a.props.id === item.id);

            if (!dom) {
                continue;
            }

            if (isPreview) {
                trueChildren.push(
                    <div className={styles.partWp}>
                        {dom}
                        {
                            isShow &&
                            <div className={`${styles.part} ${item.isShow ? styles.show : styles.hide}`}>
                                <div className={styles.tip}>
                                    {
                                        !item.isShow && <div>已隐藏，仅在编辑模式显示</div>
                                    }
                                    <div>通栏：{item.desc}</div>
                                </div>
                            </div>
                        }
                    </div>
                );
            } else {
                /* eslint-disable no-lonely-if */
                if (item.isShow) {
                    trueChildren.push(dom);
                }
            }
        }
        setTrueChildren(trueChildren);
        setVisualChildren(visualChildren);
    }, [isShow]);

    const toggleIsShow = () => setIsShow(!isShow)

    return (
        <div className={styles.container}>
            {
                isPreview &&
                <div className={styles.toolbar} onClick={toggleIsShow}>
                    {isShow ? '隐藏通栏' : '显示通栏'}
                </div>
            }
            {trueChildren}
            {visualChildren}
        </div>
    );
};

Part.propTypes = {
    data: PropTypes.array,
    children: PropTypes.array
};

export default errorBoundary(Part)
