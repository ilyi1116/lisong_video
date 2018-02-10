'use strict';

import React from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    TouchableOpacity,
    StatusBar,
} from 'react-native';
import {
    connect,
} from 'react-redux';
import XingrenFlatList from '../../components/XingrenFlatList';
import PropTypes from 'prop-types';
import Immutable from 'immutable';
import Swipeout from 'react-native-swipeout';
import { TabIconStyle } from "../../container/constants";
const util = require('../../common/Util');

import {
    loadSubscribes,
    reloadSubscribes,
    deleteSubscribe,
} from "../../actions/subscribe";
import { RefreshState } from "../../Constants";

const styles = StyleSheet.create({
    container: {
        flex:1,
        backgroundColor: '#fff',
    },
});

class SubscribeScreen extends React.Component {
    static navigationOptions =  {
        tabBarIcon: ({focused}) => {
            if (focused) {
                return <Image source={require('../imgs/subscribe_sel.png')} style={TabIconStyle.tabIcon}/>
            }
            return <Image source={require('../imgs/subscribe_unsel.png')} style={TabIconStyle.tabIcon}/>
        },
        tabBarLabel: '订阅',
        headerTitle: '订阅更新',
        headerStyle: {
            backgroundColor: '#fff',
            height: 44
        },
        headerTitleStyle: {
            color: '#052D60',
            fontSize: 18,
            alignSelf: 'center',
            fontWeight: 'bold',
        },
    };
    static propTypes = {
        offset:PropTypes.number.isRequired,
        records:PropTypes.arrayOf(PropTypes.object),
        refreshState: PropTypes.number.isRequired,
    };
    static defaultProps = {
        records:[],
        refreshState: RefreshState.Idle,
        offset:0,
    };

    constructor (props){
        super(props);
        StatusBar.setBackgroundColor('#fff');
    }

    onHeaderRefresh = (refreshState) => {
        this.props.reloadSubscribes(refreshState);
    }

    onFooterRefresh = (refreshState) => {
        let currentOffset = this.props.offset;
        this.props.loadSubscribes(refreshState, currentOffset);
    }

    shouldComponentUpdate(nextProps, nextState) {
        return nextProps.updateTime !== this.props.updateTime;
    }

    componentDidMount() {
        if (!this.props.records || this.props.records.length === 0) {
            this.onHeaderRefresh(RefreshState.HeaderRefreshing);
        }
    }
    deleteSubscribeItem(item) {
        this.props.deleteSubscribe(item.movieId);
    }

    play(item) {
        this.props.navigation.navigate('MoviePlayScreen', { code : item.hexId, episode: item.latestSerialsSrc.episode});
    }

    render() {
        return (
            <View style={styles.container}>
                <XingrenFlatList
                    data={this.props.records}
                    renderItem={({item}) =>
                        <SubscribeItor item={item}
                                       deleteSubscribeCallBack={(item) => this.deleteSubscribeItem(item)}
                                       play={(item) => this.play(item)}
                        />}
                    keyExtractor={item => item.id}
                    getItemLayout={(data, index) => (
                        {length: cellInListHeight, offset: cellInListHeight * index, index}
                    )}
                    columnWrapperStyle={styles.rowStyle}
                    onHeaderRefresh={this.onHeaderRefresh}
                    onFooterRefresh={this.onFooterRefresh}
                    refreshState={this.props.refreshState}
                    numColumns={1}
                    totalRecords={this.props.totalRecords}
                    offset={this.props.offset}
                />
            </View>
        );
    }
}

const cellInListHeight = 130;
class SubscribeItor extends React.Component {
    static propTypes = {
        item: PropTypes.object.isRequired,
        deleteSubscribeCallBack:PropTypes.func.isRequired,
        play:PropTypes.func.isRequired,
    };
    constructor (props){
        super(props);
    }

    deleteSubscribeSelf =() => {
        this.props.deleteSubscribeCallBack(this.props.item);
    }

    play = () => {
        this.props.play(this.props.item);
    }

    render() {
        let {item} = this.props;
        return (
            <Swipeout style={{backgroundColor: '#fff'}} autoClose={true} right={[
                { text: '删除', backgroundColor: 'red', onPress: this.deleteSubscribeSelf }
            ]}>
                <TouchableOpacity
                    style={{height: cellInListHeight,borderBottomColor: '#D0D0D0',borderBottomWidth: 0.5,flexDirection: 'row'}}
                    onPress={this.play}>
                    <Image
                        source={{uri: item.cover}}
                        style={{height: 110,width:70,margin: 10,borderRadius: 5}} />
                    <View style={{flex: 1,justifyContent: 'space-around'}}>
                        <Text style={{fontSize: 14,marginTop: 15, fontFamily:'PingFangSC-Semibold',color:'#404040'}}>
                            {item.title}
                        </Text>
                        <Text style={{fontSize: 14,marginTop: 10}}>
                            更新至 第{item.latestSerialsSrc.episode}集
                        </Text>
                        <Text style={{fontSize: 12,marginTop: 10, color:'#c0c0c0'}}>
                            {item.duration}
                        </Text>
                        <Text style={{marginBottom: 12, color:'#c0c0c0'}}>
                            {util.tsToDateFormat(item.movieLastUpdated, 'yyyy-MM-dd')}
                        </Text>
                    </View>
                </TouchableOpacity>
            </Swipeout>
        );
    }
}

const mapStateToProps = (state, ownProps) => {
    const data = state.getIn(['subscribe', 'root']);
    return {
        ...ownProps,
        ...(Immutable.Map.isMap(data) ? data.toJS() : data),
    };
};

export default connect(
    mapStateToProps, {
        loadSubscribes,
        reloadSubscribes,
        deleteSubscribe,
    })(SubscribeScreen);