import React, {PureComponent} from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    TouchableOpacity,
} from 'react-native';


import { RefreshState } from '../Constants';

const DEBUG = false;
const log = (text: string) => {DEBUG && console.log(text)};

const footerRefreshingText = '数据加载中…';
const footerFailureText = '点击重新加载';
const footerNoMoreDataText = '已加载全部数据';

type Props = {
    refreshState: number,
    onHeaderRefresh: (refreshState: number) => void,
    onFooterRefresh?: (refreshState: number) => void,
    data: Array<any>,

    footerContainerStyle?: any,
    footerTextStyle?: any,
    onEndReachedThreshold: number,
};

type State = {};

class XingrenFlatList extends PureComponent {
    props: Props;
    state: State;

    static defaultProps = {
        onEndReachedThreshold: 0.7,
    }

    componentWillReceiveProps(nextProps: Props) {
        log('[XingrenFlatList]  XingrenFlatList componentWillReceiveProps ' + nextProps.refreshState);
    }

    componentDidUpdate(prevProps: Props, prevState: State) {
        log('[XingrenFlatList]  XingrenFlatList componentDidUpdate ' + prevProps.refreshState);
    }

    onHeaderRefresh = () => {
        log('[XingrenFlatList]  onHeaderRefresh');

        if (this.shouldStartHeaderRefreshing()) {
            log('[XingrenFlatList]  onHeaderRefresh');
            this.props.onHeaderRefresh(RefreshState.HeaderRefreshing);
        }
    }

    onEndReached = (info: any) => {
        log('[XingrenFlatList]  onEndReached   ' + info.distanceFromEnd);

        if (this.shouldStartFooterRefreshing()) {
            log('[XingrenFlatList]  onFooterRefresh');
            this.props.onFooterRefresh && this.props.onFooterRefresh(RefreshState.FooterRefreshing);
        }
    }

    shouldStartHeaderRefreshing = () => {
        log('[XingrenFlatList]  shouldStartHeaderRefreshing');

        if (this.props.refreshState == RefreshState.HeaderRefreshing ||
            this.props.refreshState == RefreshState.FooterRefreshing) {
            return false;
        }

        return true;
    }

    shouldStartFooterRefreshing = () => {
        log('[XingrenFlatList]  shouldStartFooterRefreshing');

        let {refreshState, data, totalRecords, offset} = this.props;
        if (!data || data.length == 0) {
            return false;
        }
        if (totalRecords <= 0 ||  offset >= totalRecords) {
            return false;
        }

        return (refreshState == RefreshState.Idle);
    };

    render() {
        log('[XingrenFlatList]  render');
        return (
            <FlatList
                onEndReached={this.onEndReached}
                onEndReachedThreshold={this.props.onEndReachedThreshold}
                onRefresh={this.onHeaderRefresh}
                refreshing={this.props.refreshState == RefreshState.HeaderRefreshing}
                ListFooterComponent={this.renderFooter}
                //style={{backgroundColor:'yellow'}}
                {...this.props}
            />
        )
    }

    renderFooter = () => {
        let footer = null;

        let footerContainerStyle = [styles.footerContainer, this.props.footerContainerStyle];
        let footerTextStyle = [styles.footerText, this.props.footerTextStyle];
        switch (this.props.refreshState) {
            case RefreshState.Idle:
                footer = (<View style={footerContainerStyle} />);
                break;
            case RefreshState.Failure: {
                footer = (
                    <TouchableOpacity
                        style={footerContainerStyle}
                        onPress={() => {
                            this.props.onFooterRefresh && this.props.onFooterRefresh(RefreshState.FooterRefreshing)
                        }}
                    >
                        <Text style={footerTextStyle}>{footerFailureText}</Text>
                    </TouchableOpacity>
                );
                break;
            }
            case RefreshState.FooterRefreshing: {
                footer = (
                    <View style={footerContainerStyle} >
                        <ActivityIndicator size="small" color="#888888" />
                        <Text style={[footerTextStyle, {marginLeft: 7}]}>{footerRefreshingText}</Text>
                    </View>
                );
                break;
            }
            case RefreshState.NoMoreDataFooter: {
                footer = (
                    <View style={footerContainerStyle} >
                        <Text style={footerTextStyle}>{footerNoMoreDataText}</Text>
                    </View>
                );
                break;
            }
        }
        return footer;
    }
}

const styles = StyleSheet.create({
    footerContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 10,
        height: 44,
    },
    footerText: {
        fontSize: 14,
        color: '#555555'
    }
});

export default XingrenFlatList;