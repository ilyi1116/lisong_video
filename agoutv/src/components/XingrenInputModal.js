'use strict';

import React from 'react';
import {
    View,
    Text,
    TextInput,
    Modal,
    StyleSheet,
    ActivityIndicator,
    TouchableOpacity,
} from 'react-native';
import PropTypes from 'prop-types';
import XingrenLink from './XingrenLink';
import XingrenButton from "./XingrenButton";


export default class XingrenInputModal extends React.Component {
    static propTypes = {
        visible: PropTypes.bool,
        onClose: PropTypes.func,
        onShow: PropTypes.func,
        onSubmit: PropTypes.func,
        onCancel: PropTypes.func,
        title: PropTypes.string.isRequired,
        placeholder: PropTypes.string,
        maxLength: PropTypes.number,
    };
    static defaultProps = {
        visible: false,
        placeholder: null,
    };

    constructor(props) {
        super(props);

        this.state = { text: '', visible: this.props.visible, isBusy: false };
        this._onSubmit = this._onSubmit.bind(this);
    }

    _onSubmit(text) {
        if (typeof(text) !== 'string') {
            text = this.state.text;
        }

        this.props.onSubmit && this.props.onSubmit(text);
    }

    _onCancel() {
        this.props.onCancel && this.props.onCancel();
        this.hide();
    }

    getText() {
        return this.state.text;
    }

    close() {
        this.setState({ isBusy: false, visible: false, text: '' });
    }

    show(defaultValue = '') {
        this.setState({visible: true, text: defaultValue});
    }

    hide() {
        this.setState({visible: false});
    }

    busy() {
        this.setState({isBusy: true});
    }

    idle() {
        this.setState({isBusy: false});
    }

    _renderBusy() {
        return (
            <View style={styles.busyContainer}>
                <ActivityIndicator style={styles.busyIndicator} />
            </View>
        );
    }

    render() {
        return (
            <Modal
                visible={(this.props.visible && this.state.visible) || this.state.visible}
                transparent={true}
                onRequestClose={() => this.props.onClose && this.props.onClose()}
                onShow={() => this.props.onShow && this.props.onShow()}
                animationType={"slide"}>
                <TouchableOpacity style={styles.modalBackground} onPress={() => this.close()}>
                    <View style={styles.modalContainer}>
                        <View style={styles.modalBody}>
                            <Text style={styles.modalTitle}>{this.props.title}</Text>
                            <TextInput
                                style={styles.modalInput}
                                placeholder={this.props.placeholder}
                                placeholderTextColor="#808080"
                                underlineColorAndroid="transparent"
                                maxLength={this.props.maxLength}
                                autoFocus={true}
                                onSubmitEditing={(e) => {
                                    this._onSubmit(e.nativeEvent.text);
                                }}
                                onChangeText={(text) => {
                                    this.setState({ text, });
                                }}
                                defaultValue={this.state.text}
                            />
                        </View>
                        <View style={styles.modalFooter}>
                            <XingrenLink text={'取消'} style={styles.modalCancelButton} textStyle={styles.modalCancelButtonText} onPress={this._onCancel.bind(this)} />
                            <XingrenLink text={'确定'} style={styles.modalOKButton} textStyle={styles.modalOKButtonText} onPress={this._onSubmit.bind(this)} />
                        </View>
                        {this.state.isBusy ? this._renderBusy() : null }
                    </View>
                </TouchableOpacity>
            </Modal>
        );
    }
}


const styles = StyleSheet.create({
    modalBackground: {
        flex: 1,
        padding: 20,
        //backgroundColor: 'rgba(255,255,255,0.5)',
        backgroundColor: 'transparent',
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalContainer: {
        width: 306,
        height: 209,
        borderRadius: 5,
        backgroundColor: '#fff',
    },
    modalBody: {
        flex: 1,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalFooter: {
        height: 50,
        flexDirection: 'row',
    },
    modalCancelButton: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        borderRightWidth: 0.5,
        borderRightColor: '#ddd',
    },
    modalCancelButtonText: {
        color: '#999',
        fontSize: 17,
    },
    modalOKButton: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        borderLeftWidth: 0.5,
        borderLeftColor: '#ddd',
    },
    modalOKButtonText: {
        color: '#000',
        fontSize: 17,
    },
    modalTitle: {
        color: '#333',
        fontSize: 20,
        marginBottom: 31,
    },
    modalInput: {
        width: 267,
        height: 45,
        marginLeft: 20,
        marginRight: 20,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 2,
    },
    busyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        top: 0,
        left: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        width: 306,
        height: 209,
    },
    busyIndicator: {
        padding: 12,
        backgroundColor: '#0f0f0f',
        opacity: 0.8,
        borderRadius: 6,
    },
});