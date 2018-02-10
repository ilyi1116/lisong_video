import React from 'react';
import {
    StyleSheet,
    Image,
    View,
    TextInput,
    TouchableOpacity,
    StatusBar,
} from 'react-native';

import Immutable from 'immutable';
import { connect } from 'react-redux';
import XingrenFlatList from '../../components/XingrenFlatList';
import { MovieCellInList } from '../Movie/movieCellInList'
import PropTypes from 'prop-types';
import { RefreshState } from "../../Constants";
import { TabIconStyle } from "../../container/constants";
import { FilterPanel } from "./filterPanel";
import {
    loadCategoryList,
    reLoadWithFilters,
    loadWithFilters,
    showOrNotFilterPanel
} from '../../actions/explore';

const itemLineHeight = 250;
const styles = StyleSheet.create({
    container: {
        flex:1,
        flexDirection: 'column',
        backgroundColor: '#fff'
    },
    cloumnWrapperStyle: {
        justifyContent: 'space-between',
        paddingLeft: 6,
        paddingRight: 6,
        paddingTop: 12,
    },
    searchHeader: {
        height: 40,
        backgroundColor: '#ffffff',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    searchInput: {
        height: 28,
        flex: 1,
        backgroundColor: '#e5e5e5',
        borderRadius: 2,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 0,
        marginTop: 10,
        marginBottom: 10,
        marginLeft: 15,
    },
    searchIcon: {
        width: 15,
        height: 16,
        marginLeft: 10,
        marginRight: 10,
    },
    searchBox: {
        flex: 1,
        fontSize: 12,
        padding: 0,
    },
    filterIconStyle: {
        width: 20,
        height: 20,
    },
    filterIconContainerStyle: {
        height:40,
        justifyContent:'center',
        alignItems: 'center',
        width: 60,
    },
});

const images = {
    filterUnSel: require('./exploreImg/icon_filter.png'),
    filterSel: require('./exploreImg/icon_filter_sel.png'),
    search: require('./exploreImg/icon_search.png'),
}

class Explore extends React.Component {
    constructor(props) {
        super(props);
        StatusBar.setBackgroundColor('#fff');
    };

    static navigationOptions = ({navigation }) => {
        const { params = {} } = navigation.state
        return {
            tabBarIcon: ({focused}) => {
                if (focused) {
                    return <Image source={require('../imgs/discover_sel.png')} style={TabIconStyle.tabIcon}/>
                }
                return <Image source={require('../imgs/discover_unsel.png')} style={TabIconStyle.tabIcon}/>
            },
            tabBarLabel: '探索',
            headerTitle: '探索',
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
            header:null,
            //headerLeft: <ExploreSearchButton onPress={() => navigation.navigate('ExploreSearchPage')}/>,
            //headerRight: <ExploreFilterButton onPress={() => params.handleFilterShow()}/>
        }
    };

    static propTypes = {
        categoryObj:PropTypes.object,
        dataRet:PropTypes.object,
        filterStatus:PropTypes.object,
        records:PropTypes.arrayOf(PropTypes.object),
        refreshState: PropTypes.number.isRequired,
        offset:PropTypes.number.isRequired,
    };

    static defaultProps = {
        dataRet:{},
        filterStatus:{},
        records:[],
        refreshState: RefreshState.Idle,
        offset:0,
    };

    componentDidMount() {
        this.props.navigation.setParams({ handleFilterShow: this.setFilterShow });
        this.props.loadCategoryList();
        if (!this.props.dataRet.records || this.props.dataRet.records.length === 0) {
            this.onHeaderRefresh(RefreshState.HeaderRefreshing);
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        return true;
    }

    setFilterShow = () => {
        this.props.showOrNotFilterPanel(this.props.filterStatus.filterShow);
    }

    onHeaderRefresh = (refreshState) => {
        let ret = Immutable.Map(this.props.dataRet.selectedObj);
        this.props.reLoadWithFilters(refreshState, ret.toJS());
    }

    shouldComponentUpdate(nextProps, nextState) {
        return !this.props.updateTime || (nextProps.updateTime !== this.props.updateTime);
    }

    onFooterRefresh = (refreshState) =>  {
        let currentOffset = this.props.dataRet.offset;
        let ret = Immutable.Map(this.props.dataRet.selectedObj);
        this.props.loadWithFilters(refreshState, ret.toJS(), currentOffset);
    }

    _showProfile = (movie) => {
    }

    componentWillReceiveProps(nextProps) {
    }

    _onSearch = () => {
        // if (typeof word !== 'undefined' && word && word.trim() &&
        //     (this.props.dataRet.selectedObj && this.props.dataRet.selectedObj.word !== word)) {
        //     let selectObj = Immutable.Map(this.props.dataRet.selectedObj);
        //     let ret = selectObj.setIn(['word'], word);
        //     this.props.reLoadWithFilters(RefreshState.HeaderRefreshing, ret.toJS());
        // }
        if (this.props.dataRet.selectedObj){
            let word = this.props.dataRet.selectedObj.word;
            if (word !== 'undefined' && word && word.trim().length > 0) {
                let selectObj = Immutable.Map(this.props.dataRet.selectedObj);
                let ret = selectObj.setIn(['word'], word);
                this.props.reLoadWithFilters(RefreshState.HeaderRefreshing, ret.toJS());
            }
        }
    };

    _resetWordState = (word) => {
        //this.showResult = false;
        //this.props.clearSearchVideos();
        this.props.dataRet.selectedObj.word = word;
    };

    _renderSearchHeader = () => {
        let filterIcon = this.props.filterStatus.filterShow ?
            <Image
                source={images.filterSel}
                style={styles.filterIconStyle}
            />
            :
            <Image
                source={images.filterUnSel}
                style={styles.filterIconStyle}
            />;
        return (
            <View style={styles.searchHeader}>
                <View style={styles.searchInput}>
                    <Image
                        source={images.search}
                        style={styles.searchIcon}
                    />
                    <TextInput
                        style={styles.searchBox}
                        placeholder="请输入片名、演员等关键字"
                        placeholderTextColor="#c0c0c0"
                        underlineColorAndroid="transparent"
                        keyboardType="web-search"
                        returnKeyType="search"
                        defaultValue={this.selectedObj ? this.selectedObj.word : null}
                        onSubmitEditing={(e) => {
                            // this._onSearch(e.nativeEvent.text);
                            this._onSearch();
                        }}
                        onChangeText={(text) => {
                            //if (!text) {
                                this._resetWordState(text);
                            //}
                        }}
                    />
                    <TouchableOpacity/>
                </View>
                <TouchableOpacity style={styles.filterIconContainerStyle} activeOpacity={ 0.75 } onPress={() => this.setFilterShow()}>
                    {filterIcon}
                </TouchableOpacity>
            </View>
        );
    };

    play = (item) => {
        this.props.navigation.navigate('MoviePlayScreen', { code : item.hexId, episode: 1});
    }

    render (){
        return (
            <View style={styles.container}>
                {this._renderSearchHeader()}
                {this.props.filterStatus.filterShow && <FilterPanel {...this.props}/>}
                <XingrenFlatList
                    data={this.props.dataRet.records}
                    renderItem={({item}) => <MovieCellInList item={item} onPress={this.play} /> }
                    keyExtractor={item => item.id}
                    getItemLayout={(data, index) => (
                        {length: itemLineHeight, offset: itemLineHeight * index, index}
                    )}
                    columnWrapperStyle={styles.cloumnWrapperStyle}
                    //ListHeaderComponent={this.props.filterStatus.filterShow && this._renderHeader}

                    onHeaderRefresh={this.onHeaderRefresh}
                    onFooterRefresh={this.onFooterRefresh}
                    //style={{backgroundColor:'#fff'}}
                    refreshState={this.props.dataRet.refreshState}
                    numColumns={3}
                    totalRecords={this.props.dataRet.totalRecords}
                    offset={this.props.dataRet.offset}
                />
            </View>
        );
    }
}

const mapStateToProps = (state, ownProps) => {
    let data = state.getIn(['explore', 'root']);
    if (Immutable.Map.isMap(data)) {
        data = data.toJS();
    }
    return {
        ...ownProps,
        ...data,
    };
}
export default connect(
    mapStateToProps, {
        showOrNotFilterPanel:showOrNotFilterPanel,
        reLoadWithFilters: reLoadWithFilters,
        loadWithFilters:loadWithFilters,
        loadCategoryList:loadCategoryList,
    })(Explore);
