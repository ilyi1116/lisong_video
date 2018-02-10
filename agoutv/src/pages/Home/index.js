import React, {Component} from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    FlatList,
    StatusBar,
} from 'react-native'
import PropTypes from 'prop-types';
import XingrenFlatList from '../../components/XingrenFlatList';
import {MovieCellInList, MovieCellInSection} from '../Movie/movieCellInList'
import LoadMinimalSwiper from '../../components/LoadMinimalSwiper';

import Immutable from 'immutable';
import { connect } from 'react-redux';
import { loadBanners,loadHots,loadNavs } from '../../actions/main';
import { RefreshState } from "../../Constants";
import { TabIconStyle } from "../../container/constants";


const styles = StyleSheet.create({
    cloumnWrapperStyle: {
        justifyContent: 'space-between',
        paddingLeft: 6,
        paddingRight: 6,
        paddingTop: 12,
    },

    sectionCloumnWrapperStyle: {
        justifyContent: 'space-around',
        paddingTop: 12,
    },

    hotContainer: {
        flexDirection: 'row',
        paddingLeft: 15,
        height: 35,
    },
    hotIcon: {
        width: 12,
        height: 14,
        marginTop: 18,
    },
    hotTextStyle:{
        fontSize: 14,
        color: '#404040',
        marginLeft:5,
        marginTop: 15,
        textAlignVertical: 'center'
    },
    sectionTextStyle:{
        fontSize: 14,
        color: '#404040',
        marginLeft:15,
        marginTop: 15,
        textAlignVertical: 'center'
    },

    sectionContainer: {
        marginTop: 10,
        flexDirection: 'column',
        borderTopColor: '#d0d0d0',
        borderTopWidth: 0.5,
    },
});

class Home extends Component {
    static navigationOptions = {
        tabBarIcon: ({focused}) => {
            if (focused) {
                return <Image source={require('../imgs/home_sel.png')} style={TabIconStyle.tabIcon}/>
            }
            return <Image source={require('../imgs/home_unsel.png')} style={TabIconStyle.tabIcon}/>
        },
        tabBarLabel: '主页',
        headerTitle: '主页',
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
        banner: PropTypes.arrayOf(PropTypes.object),
        hot: PropTypes.arrayOf(PropTypes.object),
        nav: PropTypes.arrayOf(PropTypes.object),
        refreshState: PropTypes.number.isRequired,
        page: PropTypes.number.isRequired,
        updateTime: PropTypes.number,
    };

    static defaultProps = {
        banner:[],
        hot:[],
        nav:[],
        refreshState: RefreshState.Idle,
        page: 1,
    };

    constructor(props) {
        super(props);
        StatusBar.setBackgroundColor('#fff');
    }

    componentDidMount() {
        if (!this.props.banners || this.props.banners.length === 0) {
            this.onHeaderRefresh(RefreshState.HeaderRefreshing);
        }
    }

    onHeaderRefresh = (refreshState) => {
        this.props.loadBanners(refreshState);
        this.props.loadNavs(refreshState);
        this.props.loadHots(refreshState);
    }

    onFooterRefresh = (refreshState) => {
        //this.props.loadActresses(refreshState, '', this.props.page + 1);
    }

    _renderFooter = () => {
        return (
            <FlatList
                data={this.props.nav}
                keyExtractor={item => item.type}
                renderItem={({item}) => (
                    <SectionItem sectionMapData={item} play={(item) => this.play(item)}/>
                ) }
            />
        );
    }

    _renderHeader = () => {
        let bannerRecords = (!this.props.banner || this.props.banner.length === 0) ? [] : this.props.banner[0];
        return (
            <View style={{flex: 1}}>
                <LoadMinimalSwiper banners = {bannerRecords} {...this.props}/>
                <View style={styles.hotContainer}>
                    <Image
                        source={require('../imgs/hot_fire.png')}
                        style={[styles.hotIcon]}
                    />
                    <Text style={[styles.hotTextStyle, { fontFamily: 'PingFangSC-Medium' }]}>24小时热播</Text>
                </View>
            </View>
        );
    }

    play = (item) => {
        this.props.navigation.navigate('MoviePlayScreen', { code : item.hexId, episode: 1});
    }

    render() {
        let hotRecords = (!this.props.hot || this.props.hot.length === 0) ? [] : this.props.hot[0].data;
        return (
            <View style = {{flex:1, backgroundColor: '#fff'}}>
                <XingrenFlatList
                    data={hotRecords}
                    renderItem={({item}) => <MovieCellInList item={item} onPress={this.play} /> }
                    keyExtractor={item => item.id}
                    getItemLayout={(data, index) => (
                         {length: 193, offset: 193 * index, index}
                     )}
                    columnWrapperStyle={styles.cloumnWrapperStyle}
                    ListHeaderComponent={this._renderHeader}
                    ListFooterComponent={this._renderFooter}

                    onHeaderRefresh={this.onHeaderRefresh}
                    onFooterRefresh={this.onFooterRefresh}
                    //style={styles.listStyle}
                    refreshState={this.props.refreshState}
                    numColumns={3}
                />
            </View>
        );
    }
}
export class SectionItem extends React.Component {
    static propTypes = {
        sectionMapData: PropTypes.object.isRequired,
        play:PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);
    }

    play = (item) => {
        this.props.play(item);
    }

    render() {
        const {sectionMapData} = this.props;
        return (
            <View style={styles.sectionContainer}>
                <Text style={[styles.sectionTextStyle, { fontFamily: 'PingFangSC-Medium' }]}>{sectionMapData.name}</Text>
                <XingrenFlatList
                    data={sectionMapData.data}
                    renderItem={({item}) => <MovieCellInList item={item} onPress={this.play} /> }
                    keyExtractor={item => item.id}
                    getItemLayout={(data, index) => (
                        {length: 193, offset: 193 * index, index}
                    )}
                    columnWrapperStyle={styles.cloumnWrapperStyle}
                    refreshState={this.props.refreshState}
                    numColumns={3}
                />
            </View>
        );
    }
}


const mapStateToProps = (state, ownProps) => {
    const data = state.getIn(['main', 'home']);
    return {
        ...ownProps,
        ...(Immutable.Map.isMap(data) ? data.toJS() : data),
    };
}
export default connect(
    mapStateToProps, {
        loadBanners,
        loadHots,
        loadNavs
    })(Home);
