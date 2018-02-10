'use strict';

import React from 'react';
import {
    View,
    Text,
    Animated,
    Modal,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
} from 'react-native';
import PropTypes from 'prop-types';

export default class XingrenActionSheet extends React.Component {
    static propTypes = {
        title: PropTypes.string,
        content: PropTypes.object,
        show: PropTypes.func,
        hide: PropTypes.func,
        side: PropTypes.string,
    };

    static defaultProps = {
        side: 'bottom',
    };

    static slideProps = {
        bottom: ['height', 'translateY'],
        top: ['height', 'translateY'],
        right: ['width', 'translateX'],
        left: ['width', 'translateX'],
    };

    constructor(props) {
        super(props);

        this.translateY = 150;
        this.state = {
            visible: false,
            sheetAnim: new Animated.Value(this.translateY),
        };
        this.cancel = this.cancel.bind(this);
    }

    /**
     * 渲染标题
     * @returns {*}
     * @private
     */
    _renderTitle() {
        const { title, titleStyle } = this.props;
        if (!title) {
            return null
        }
        // 确定传入的是不是一个React Element，防止渲染的时候出错
        if (React.isValidElement(title)) {
            return (
                <View style={styles.title}>{title}</View>
            )
        }

        return (
            <Text style={[styles.titleText, titleStyle]}>{title}</Text>
        )
    }

    /**
     * 渲染内容布局
     * @returns {XML}
     * @private
     */
    _renderContainer() {
        const { content } = this.props;
        return (
            <View style={styles.container}>
                { content }
            </View>
        )
    }


    /**
     * 控制Modal点击关闭，Android返回键关闭
     */
    cancel() {
        this.hide();
    }

    /**
     * 显示
     */
    show() {
        this.setState({visible: true});
        Animated.timing(this.state.sheetAnim, {
            toValue: 0,
            duration: 250
        }).start();
    }

    /**
     * 隐藏
     */
    hide() {
        Animated.timing(this.state.sheetAnim, {
            toValue: this.translateY,
            duration: 250
        }).start(() => this.setState({ visible: false }));
    }

    /**
     * Modal为最外层，ScrollView为内容层
     * @returns {XML}
     */
    render() {
        const { visible, sheetAnim } = this.state;
        const { bdStyle } = this.props;
        const slide = XingrenActionSheet.slideProps[this.props.slide];
        return(
            <Modal
                visible={ visible }
                transparent={ true }
                animationType="fade"
                onRequestClose={ this.cancel }
            >
                <View style={ styles.wrapper }>
                    <TouchableOpacity style={styles.overlay} onPress={this.cancel}></TouchableOpacity>
                    <Animated.View
                        style={[styles['bd' + this.props.slide], { [slide[0]]: this.translateY, transform: [{[slide[1]]: sheetAnim}] }, bdStyle]}>
                        { this._renderTitle() }
                        <ScrollView
                            horizontal={ true }
                            showsHorizontalScrollIndicator={ false }>
                            {this._renderContainer()}
                        </ScrollView>
                    </Animated.View>
                </View>
            </Modal>
        )
    }
}

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
    },
    bdbottom: {
        position: 'absolute',
        bottom: 0,
        left: 0,
    },
    bdtop: {
        position: 'absolute',
        top: 0,
        left: 0,
    },
    bdleft: {
        position: 'absolute',
        top: 0,
        left: 0,
    },
    bdright: {
        position: 'absolute',
        bottom: 0,
        right: 0,
    },
    overlay: {
        flex: 1,
        backgroundColor: '#0f0f0f',
        opacity: 0.5,
    },
    title: {

    },
    titleText: {
        fontSize: 15,
        color: '#000',
    },
    container: {

    },
});