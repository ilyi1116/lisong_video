'use strict';

import React from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    TouchableOpacity
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
    loadHistories,
    reloadHistories,
    deleteHistory,
} from "../../actions/history";
import { RefreshState } from "../../Constants";

const styles = StyleSheet.create({
    container: {
        flex:1,
        backgroundColor: '#fff',
    },
});

class HistoryScreen extends React.Component {
    static navigationOptions = ({navigation }) => {
        return {
            tabBarIcon: ({focused}) => {
                if (focused) {
                    return <Image source={require('../imgs/my_sel.png')} style={TabIconStyle.tabIcon}/>
                }
                return <Image source={require('../imgs/my_unsel.png')} style={TabIconStyle.tabIcon}/>
            },
            tabBarLabel: '我的',
            headerTitle: '历史记录',
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
            headerRight:<Text/>
        }
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
    }

    onHeaderRefresh = (refreshState) => {
        this.props.reloadHistories(refreshState);
    }

    onFooterRefresh = (refreshState) => {
        let currentOffset = this.props.offset;
        this.props.loadHistories(refreshState, currentOffset);
    }

    shouldComponentUpdate(nextProps, nextState) {
        return nextProps.updateTime !== this.props.updateTime;
    }

    componentDidMount() {
        if (!this.props.records || this.props.records.length === 0) {
            this.onHeaderRefresh(RefreshState.HeaderRefreshing);
        }
    }
    deleteCollectionItem(item) {
        this.props.deleteHistory(item.movieId, item.serialsSrcId);
    }

    play(item) {
        this.props.navigation.navigate('MoviePlayScreen', { code : item.hexId, episode: item.src.episode});
    }
    render() {
        return (
            <View style={styles.container}>
                <XingrenFlatList
                    data={this.props.records}
                    renderItem={({item}) => <CollectionItor item={item} deleteCollectionCallBack={(item) => this.deleteCollectionItem(item)}
                                                            play={(item) => this.play(item)}/> }
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
class CollectionItor extends React.Component {
    static propTypes = {
        item: PropTypes.object.isRequired,
        deleteCollectionCallBack:PropTypes.func.isRequired,
        play:PropTypes.func.isRequired,
    };

    deleteCollectionSelf =() => {
        this.props.deleteCollectionCallBack(this.props.item);
    }

    play = () => {
        this.props.play(this.props.item);
    }

    render() {
        let {item} = this.props;
        return (
            <Swipeout style={{backgroundColor:'#fff'}} autoClose={true} right={[
                { text: '删除', backgroundColor: 'red', onPress: this.deleteCollectionSelf }
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
                        {
                            item.type === 2 && item.src && item.src.episode &&
                            <Text style={{fontSize: 14, marginTop: 15}}>
                                第{item.src.episode}集
                            </Text>
                        }
                    </View>
                </TouchableOpacity>
            </Swipeout>
        );
    }
}

const mapStateToProps = (state, ownProps) => {
    const data = state.getIn(['history', 'root']);
    return {
        ...ownProps,
        ...(Immutable.Map.isMap(data) ? data.toJS() : data),
    };
};

export default connect(
    mapStateToProps, {
        loadHistories,
        reloadHistories,
        deleteHistory,
    })(HistoryScreen);