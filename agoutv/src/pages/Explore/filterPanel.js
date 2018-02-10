import React from 'react';
import { StyleSheet,View,FlatList,TouchableOpacity,Text,ScrollView } from 'react-native';
import Immutable from 'immutable';
import PropTypes from 'prop-types';
import { RefreshState } from "../../Constants";


export class FilterPanel extends React.PureComponent {
    constructor(props) {
        super(props);
    }
    static propTypes = {
        categoryObj: PropTypes.object,
    };
    static defaultProps = {
    };

    selectZoneCallBack = (option) => {
        let selectObj = Immutable.Map(this.props.dataRet.selectedObj);
        let ret = selectObj.setIn(['zone'], option.id);
        this.props.reLoadWithFilters(RefreshState.HeaderRefreshing,  ret.toJS());
    }

    selectGenreCallBack = (option) => {
        let selectObj = Immutable.Map(this.props.dataRet.selectedObj);
        let ret = selectObj.setIn(['genre'], option.id);
        this.props.reLoadWithFilters(RefreshState.HeaderRefreshing, ret.toJS());
    }
    selectYearCallBack = (option) => {
        let selectObj = Immutable.Map(this.props.dataRet.selectedObj);
        let ret = selectObj.setIn(['year'], option.id);
        this.props.reLoadWithFilters(RefreshState.HeaderRefreshing, ret.toJS());
    }

    selectHotCallBack = (option) => {
        let selectObj = Immutable.Map(this.props.dataRet.selectedObj);
        let ret = selectObj.setIn(['hot'], option.id);
        this.props.reLoadWithFilters(RefreshState.HeaderRefreshing, ret.toJS());
    }
    render() {
        let categoryObj = this.props.categoryObj;
        let selectedObj = this.props.dataRet.selectedObj;
        return (
            <View style={styles.filterContainerStyle}>
                <SegmentedControls records = {categoryObj.zone}     selectedItemId= {selectedObj.zone}  selectItemCallBack= {this.selectZoneCallBack} />
                <SegmentedControls records = {categoryObj.genre}    selectedItemId= {selectedObj.genre} selectItemCallBack= {this.selectGenreCallBack} />
                <SegmentedControls records = {categoryObj.year}     selectedItemId= {selectedObj.year}  selectItemCallBack= {this.selectYearCallBack} />
                <SegmentedControls records = {categoryObj.hot}      selectedItemId={selectedObj.hot}   selectItemCallBack= {this.selectHotCallBack} />
                <View style= {styles.divider}><Text/></View>
            </View>
        );
    }
}

export class SegmentedControls extends React.Component {
    constructor(props) {
        super(props);
    }

    static propTypes = {
        selectedItemId:PropTypes.any,
        records:PropTypes.arrayOf(PropTypes.object),
        selectItemCallBack:PropTypes.func.isRequired,
    };

    setSelectedOption = (option) => {
        this.props.selectItemCallBack(option);
    }

    render() {
        let records = this.props.records;
        let selectItemId = this.props.selectedItemId;
        let selectedItem = records[0];
        for (let itemItor in records) {
            let itemValue = records[itemItor];
            if(itemValue.id === selectItemId) {
                selectedItem = itemValue;
                break;
            }
        }
        return (
            <FlatList
                data={this.props.records}
                keyExtractor={item => item.id}
                renderItem={({item}) => (
                    (selectedItem.id === item.id) ?
                        <View style={styles.selectedCellContainer}>
                            <TouchableOpacity style={styles.selectedCell} onPress={() => this.setSelectedOption(item)}>
                                <Text style={styles.selectedCellText} numberOfLines={1}>{item.name}</Text>
                            </TouchableOpacity>
                        </View> :
                        <View style={styles.unSelectedCellContainer}>
                            <TouchableOpacity style={styles.unSelectedCell} onPress={() => this.setSelectedOption(item)}>
                                <Text style={styles.unSelectedCellText} numberOfLines={1}>{item.name}</Text>
                            </TouchableOpacity>
                        </View>
                ) }
                getItemLayout={(data, index) => (
                    {length: 70, offset: 70 * index, index}
                )}
                showsHorizontalScrollIndicator = {false}
                horizontal={true}
                style={{flex:1}}
                initialNumToRender={20}
            />
        );
    }
}

const styles = StyleSheet.create({
    filterContainerStyle: {
        height:160,
        marginRight: 15,
    },
    divider: {
        height: 5,
        backgroundColor: '#efefef'
    },
    selectedCellContainer: {
        // width: util.SCREEN_WIDTH / 5,
        alignItems: 'center',
        justifyContent:'center',
        height: 40,
    },
    selectedCell: {
        borderColor: '#042d5f',
        borderWidth: 0.5,
        borderRadius: 12,
        width: 70,
        height: 25,
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center'
    },
    selectedCellText: {
        fontSize: 12,
        color: '#052d60',
        alignContent: 'center',
    },
    unSelectedCellContainer: {
        //width: util.SCREEN_WIDTH / 5,
        alignItems: 'center',
        justifyContent:'center',
        height: 40,
    },
    unSelectedCell: {
        borderColor: '#c0c0c0',
        borderWidth: 0,
        borderRadius: 5,
        width: 70,
        height: 25,
        justifyContent: 'center',
        alignItems: 'center',
    },
    unSelectedCellText: {
        fontSize: 12,
        color: '#c0c0c0',
        alignContent: 'center',
    },
});