import React from 'react';
import {
    Text,
    TouchableOpacity,
    StyleSheet,
    Image,
} from 'react-native'
import PropTypes from 'prop-types';

const util = require('../../common/Util');
const threeColumnCoverWidth = (util.SCREEN_WIDTH - 24) / 3;
const twoColumnCoverWidth = (util.SCREEN_WIDTH - 18) / 2;

const styles = StyleSheet.create({
    cellTouchableStyle: {
        width: threeColumnCoverWidth,
    },

    coverImgStyle:{
        width: threeColumnCoverWidth,
        height: 170,
    },

    descTextStyle: {
        fontSize: 12,
        color: '#404040',
        alignSelf: 'center',
        height:23,
        textAlignVertical: 'center'
    },

    sectionCellTouchableStyle: {
        width: twoColumnCoverWidth,
    },

    sectionCoverImgStyle:{
        width: twoColumnCoverWidth,
        height: 100,
    },

    sectionDescTextStyle: {
        fontSize: 12,
        color: '#404040',
        alignSelf: 'center',
        height:23,
        textAlignVertical: 'center'
    },


});

export class MovieCellInList extends React.Component {
    static propTypes = {
        item: PropTypes.object.isRequired,
        onPress: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);

        this.onPress = this.onPress.bind(this);
    }

    onPress(item) {
        this.props.onPress(item);
    }

    render() {
        const {item} = this.props;
        return (
            <TouchableOpacity activeOpacity={ 0.75 } style={styles.cellTouchableStyle} onPress={() => this.onPress(item)}>
                <Image
                    source={{uri: item.cover}}
                    style={styles.coverImgStyle}
                />
                <Text style={[styles.descTextStyle, { fontFamily: 'PingFangSC-Regular' }]} numberOfLines={1}>{item.title}</Text>
            </TouchableOpacity>
        );
    }
}

export class MovieCellInSection extends React.Component {
    static propTypes = {
        item: PropTypes.object.isRequired,
        onPress: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);

        this.onPress = this.onPress.bind(this);
    }

    onPress(item) {
        this.props.onPress(item);
    }

    render() {
        const {item} = this.props;
        return (
            <TouchableOpacity activeOpacity={ 0.75 } style={[styles.sectionCellTouchableStyle]} onPress={() => this.onPress(item)}>
                <Image
                    source={{uri: item.cover}}
                    style={styles.sectionCoverImgStyle}
                />
                <Text style={[styles.sectionDescTextStyle, { fontFamily: 'PingFangSC-Regular' }]} numberOfLines={1}>{item.title}</Text>
            </TouchableOpacity>
        );
    }
}
