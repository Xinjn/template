import React, { PureComponent } from 'react'
import style from './index.module.scss'

interface MarginAndPaddingProps {
    margin?: string
    padding?: string
    onUpdate: (data: object) => void
}

export default class MarginAndPadding extends PureComponent<MarginAndPaddingProps> {
    
    state = {
        hasMargin: false,
        hasPadding: false,
        margin: {
            top: '',
            bottom: '',
            left: '',
            right: ''
        },
        padding: {
            top: '',
            bottom: '',
            left: '',
            right: ''
        }
    }
    
    componentDidMount() {
        const { margin, padding } = this.props
        console.log({ margin, padding })
        let newState = {}
        if (margin) {
            const [ marginTop, marginRight, marginBottom, marginLeft ] = margin.split(' ').map(a => a.replace('px', ''))
            newState.margin = {
                top: marginTop,
                bottom: marginBottom,
                left: marginLeft,
                right: marginRight
            }
        }
        if (padding) {
            const [ paddingTop, paddingRight, paddingBottom, paddingLeft ] = padding.split(' ').map(a => a.replace('px', ''))
            newState.padding = {
                top: paddingTop,
                bottom: paddingBottom,
                left: paddingLeft,
                right: paddingRight
            }
        }

        const hasMargin = Object.keys(this.props).includes('margin')
        const hasPadding = Object.keys(this.props).includes('padding')

        this.setState({ ...newState, hasMargin, hasPadding })
    }

    handleInputChange = (e) => {
        const { value, dataset: { prop, direction } } = e.currentTarget

        this.setState({
            [prop]: {
                ...this.state[prop],
                [direction]: value.replace(/[^\-0-9]/g, '')
            }
        }, this.updateData)
    }
    
    updateData = () => {
        const { onUpdate } = this.props
        const { padding: { left: paddingLeft, top: paddingTop, right: paddingRight, bottom: paddingBottom }, margin: { left: marginLeft, top: marginTop, right: marginRight, bottom: marginBottom }, hasMargin, hasPadding } = this.state
        let finalData = {}
        if (hasMargin) {
            finalData.margin = `${marginTop || 0}px ${marginRight || 0}px ${marginBottom || 0}px ${marginLeft || 0}px`
        }
        if (hasPadding) {
            finalData.padding = `${paddingTop || 0}px ${paddingRight || 0}px ${paddingBottom || 0}px ${paddingLeft || 0}px`
        }
        onUpdate(finalData)
    }

    render() {
        const { padding: { left: paddingLeft, top: paddingTop, right: paddingRight, bottom: paddingBottom }, margin: { left: marginLeft, top: marginTop, right: marginRight, bottom: marginBottom }, hasMargin, hasPadding } = this.state
        return (
            <div className={style.wrap}>
                <div className={style.marginAndPaddingContainer}>
                    <div className={`${style.margin} ${hasMargin ? '' : style.hide}`}>
                        <div className={style.marginTop}>
                            <span className={style.hInput}>
                                <input data-prop="margin" data-direction="top" placeholder="0" value={marginTop} onInput={this.handleInputChange} />
                            </span>
                        </div>
                        <div className={style.marginRight}>
                            <span className={style.vInput}>
                                <input data-prop="margin" data-direction="right" placeholder="0"  value={marginRight} onInput={this.handleInputChange} />
                            </span>
                        </div>
                        <div className={style.marginBottom}>
                            <span className={style.helpTxt}>外边距</span>
                            <span className={`${style.hInput} ${style.bottom}`}>
                                <input data-prop="margin" data-direction="bottom" placeholder="0" value={marginBottom} onInput={this.handleInputChange} />
                            </span>
                        </div>
                        <div className={style.marginLeft}>
                            <span className={`${style.vInput} ${style.left}`}>
                                <input data-prop="margin" data-direction="left" placeholder="0" value={marginLeft} onInput={this.handleInputChange} />
                            </span>
                        </div>
                    </div>

                    <div className={`${style.padding} ${hasPadding ? '' : style.hide}`}>
                        <div className={style.paddingTop}>
                            <span className={style.hInput}>
                                <input data-prop="padding" data-direction="top" placeholder="0" value={paddingTop} onInput={this.handleInputChange} />
                            </span>
                        </div>
                        <div className={style.paddingRight}>
                            <span className={style.vInput}>
                                <input data-prop="padding" data-direction="right" className={style.padding} placeholder="0" maxLength={3} value={paddingRight} onInput={this.handleInputChange} />
                            </span>
                        </div>
                        <div className={style.paddingBottom}>
                            <span className={style.helpTxt}>内边距</span>
                            <span className={`${style.hInput} ${style.bottom}`}>
                                <input data-prop="padding" data-direction="bottom" placeholder="0" maxLength={3} value={paddingBottom} onInput={this.handleInputChange} />
                            </span>
                        </div>
                        <div className={style.paddingLeft}>
                            <span className={`${style.vInput} ${style.left}`}>
                                <input data-prop="padding" data-direction="left" className={style.padding} placeholder="0" maxLength={3} value={paddingLeft} onInput={this.handleInputChange} />
                            </span>
                        </div>
                    </div>
                </div>

            </div>
        )
    }
}
