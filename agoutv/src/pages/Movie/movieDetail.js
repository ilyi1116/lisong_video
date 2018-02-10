import React from 'react';
import { Image,View,Text,TouchableOpacity,StyleSheet,FlatList } from 'react-native';
import PropTypes from 'prop-types';
import BaseComponent from '../../components/BaseComponent';
import ScrollableTabView, {DefaultTabBar, } from 'react-native-scrollable-tab-view';
const util = require('../../common/Util');
const images = {
    like: require('./movieImg/icon_like.png'),
    unLike: require('./movieImg/icon_unlike.png'),
    subscribe: require('./movieImg/icon_subscribed.png'),
    unSubscribe: require('./movieImg/icon_unsubscribe.png'),
    cache:require('./movieImg/icon_cache_download.png'),
}

export class MovieDetail extends React.Component {
    static propTypes = {
        video: PropTypes.object,
    };


    _renderMovieTitleBar(video) {
        return(
            <View style={[styles.titleBar, styles.divider]}>
                <Text style={styles.title}>{video.title}</Text>
                <View style={styles.buttonPanel}>
                    <View style={styles.statsPanel}>
                        <Text style={styles.statsText}>{util.numHuman(video.totalPlay)}次播放, {util.numHuman(video.totalFav)}次收藏</Text>
                    </View>
                    <View style={styles.buttonsPanel}>
                        {this._renderSubscribeButton(video)}
                        {/*{this._renderCacheButton(video)}*/}
                        {this._renderFavButton(video)}
                    </View>
                </View>
            </View>
        )
    };

    _renderFavButton(video) {
        let isSeria = (video && video.type === 2)  ? true : false;
        if (isSeria) {
            let serialId = -1;
            let paramEpisode = this.props.episode;
            let isFav = false;
            for(var episodeKey in video.playLink){
                let episodeValue = video.playLink[episodeKey];
                if (episodeValue.episode && episodeValue.episode === paramEpisode) {
                    serialId = episodeValue.serialsSrcId;
                    if(episodeValue.isFav) {
                        isFav = true;
                        break;
                    }
                }
            }
            if (isFav) {
                return (
                    <TouchableOpacity style={styles.iconButton} onPress={() => this.props.deleteSeriaFav(this.props.video.id, this.props.code, paramEpisode, serialId)}>
                        <Image
                            source={images.like}
                            style={styles.favIcon}
                        />
                    </TouchableOpacity>
                );
            }else{
                return (
                    <TouchableOpacity style={styles.iconButton} onPress={() => this.props.addSeriaFav(this.props.video.id, this.props.code, paramEpisode, serialId)}>
                        <Image
                            source={images.unLike}
                            style={styles.favIcon}
                        />
                    </TouchableOpacity>
                );
            }
        } else {
            let isFav = video.isFav ? true : false;
            if (isFav) {
                return (
                    <TouchableOpacity style={styles.iconButton} onPress={() => this.props.deleteFav(this.props.video.id, this.props.code)}>
                        <Image
                            source={images.like}
                            style={styles.favIcon}
                        />
                    </TouchableOpacity>
                );
            } else {
                return (
                    <TouchableOpacity style={styles.iconButton} onPress={() => this.props.addFav(this.props.video.id, this.props.code)}>
                        <Image
                            source={images.unLike}
                            style={styles.favIcon}
                        />
                    </TouchableOpacity>
                );
            }
        }
    }


    _renderSubscribeButton(video) {
        let isSeria = (video && video.type === 2)  ? true : false;
        if (isSeria) {
            if (this.props.video.subscribe) {
                return (
                    <TouchableOpacity style={styles.iconButton} onPress={() => this.props.deleteSubscribe(this.props.video.id, this.props.code)}>
                        <Image
                            source={images.subscribe}
                            style={styles.subScribeIcon}
                        />
                    </TouchableOpacity>
                );
            } else {
                return (
                    <TouchableOpacity style={styles.iconButton}
                                      onPress={() => this.props.addSubscribe(this.props.video.id, this.props.code)}>
                        <Image
                            source={images.unSubscribe}
                            style={styles.subScribeIcon}
                        />
                    </TouchableOpacity>
                );
            }
        }
    }

    _addCache() {
        this._actionSheet && this._actionSheet.show();
    }

    _renderCacheButton(video) {
        return (
            <TouchableOpacity style={styles.iconButton} onPress={this._addCache.bind(this)}>
                <Image
                    source={require('./movieImg/icon_cache_download.png')}
                    style={styles.cacheIcon}
                />
            </TouchableOpacity>
        );
    }

    _serialDetail = (superProps) => {
        return (
            <ScrollableTabView
                initialPage={0}
                renderTabBar={() => <DefaultTabBar
                    backgroundColor='#fff'
                    inactiveTextColor='#c0c0c0'

                    activeTextColor='#052D60'
                    underlineStyle={{height:2,backgroundColor:'#052D60'}}
                    textStyle={{fontSize: 12,fontFamily: 'PingFangSC-Medium'}}
                    style={{height: 40,paddingTop:10, borderBottomWidth: 0.5}}
                />}
            >
                <SummaryTab tabLabel='剧情介绍' screenProps = {superProps}/>
                <SelectEpisodeTab tabLabel='剧集选择' screenProps = {superProps}/>
            </ScrollableTabView>
        );
    }

    render() {
        let video = this.props.video;
        let isSeria = (video.type === 2)  ? true : false;
        const movieTitleBar = this._renderMovieTitleBar(video);
        if (isSeria) {
            let renderObj = this._serialDetail(this.props);
            return (
                <View style= {{flex:1}}>
                    {movieTitleBar}
                    {renderObj}
                </View>
            );
        }else {
            return(
                <View style= {{flex:1}}>
                    {movieTitleBar}
                    <SummaryTab screenProps = {this.props}/>
                </View>
            );
        }
    }
}

class SummaryTab extends BaseComponent {
    static propTypes = {
        screenProps: PropTypes.object.isRequired,
    };

    render() {
        let video = this.props.screenProps.video;
        let showSummary = video && video.summary;
        let summary;
        if (showSummary) {
            summary = '         ' + video.summary.trim()
        }
        return(
            <View style={styles.summaryRow}>
                <Text style={styles.fieldLabel}>{summary}</Text>
            </View>
        )
    };
}

class SelectEpisodeTab extends BaseComponent {
    static propTypes = {
        screenProps: PropTypes.object.isRequired,
    };
    static defaultProps = {
        selectedOption:1
    };

    setSelectedOption = (selectedEpisode) => {
        if (selectedEpisode != this.props.screenProps.episode) {
            let video = this.props.screenProps.video;
            let code = this.props.screenProps.code;
            let episodeValue = video.playLink[selectedEpisode];
            this.props.screenProps.playVideo(video.id, code, selectedEpisode, episodeValue.serialsSrcId);
        }
    }

    render(){
        let video = this.props.screenProps.video;
        let episodeRecords = [];
        for(var episodeKey in video.playLink){
            episodeRecords.push(Number.parseInt(episodeKey));
        }

        return (
            <FlatList
                data={episodeRecords}
                keyExtractor={item => item}
                renderItem={({item}) => (
                    (item === this.props.screenProps.episode) ?
                        <View style={styles.selectedCellContainer}>
                            <TouchableOpacity style={styles.selectedCell} onPress={() => this.setSelectedOption(item)}>
                                <Text style={styles.selectedCellText} numberOfLines={1}>{item}</Text>
                            </TouchableOpacity>
                        </View> :
                        <View style={styles.unSelectedCellContainer}>
                            <TouchableOpacity style={styles.unSelectedCell} onPress={() => this.setSelectedOption(item)}>
                                <Text style={styles.unSelectedCellText} numberOfLines={1}>{item}</Text>
                            </TouchableOpacity>
                        </View>
                ) }
                columnWrapperStyle={styles.cloumnWrapperStyle}
                horizontal={false}
                numColumns={5}
                initialNumToRender={20}
            />
        );
    }
}

const styles = StyleSheet.create({

    background: {
        flex: 1,
    },
    titleBar: {
        paddingTop: 15,
        paddingLeft: 15,
        paddingRight: 15,
        paddingBottom: 5,
    },
    divider: {
        borderBottomColor: '#c0c0c0',
        borderBottomWidth: 0.5,
    },
    title: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#404040',
    },
    summaryRow: {
        marginTop: 20,
        marginLeft: 20,
        marginRight: 20,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
    },
    fieldLabel: {
        color: '#404040',
        fontSize: 12,
    },
    buttonPanel: {
        flexDirection: 'row',
        height: 30,
    },
    iconButton: {
        width: 30,
        height: 30,
        alignItems: 'flex-end',
        justifyContent: 'space-around',
        marginTop: 5,
    },
    subScribeIcon: {
        width: 14,
        height: 18,
    },
    favIcon: {
        width: 18,
        height: 15,
    },
    cacheIcon: {
        width: 14,
        height: 18,
    },
    statsPanel: {
        flexDirection: 'row',
        flex: 1,
        alignItems: 'flex-end',
    },
    statsText: {
        fontSize: 10,
        color: '#404040',
    },
    buttonsPanel: {
        flexDirection: 'row',
        flex: 1,
        justifyContent: 'flex-end',
    },

    cloumnWrapperStyle: {
        justifyContent: 'flex-start',
        flexWrap: 'wrap'
    },

    selectedCellContainer: {
        width: util.SCREEN_WIDTH / 5,
        alignItems: 'center',
        height: 80,
        justifyContent:'center',

    },
    selectedCell: {
        borderColor: '#052d60',
        borderWidth: 0.5,
        borderRadius: 20,
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center'
    },
    selectedCellText: {
        fontSize: 15,
        color: '#052d60',
        alignContent: 'center',
    },
    unSelectedCellContainer: {
        width: util.SCREEN_WIDTH / 5,
        alignItems: 'center',
        justifyContent:'center',
        height: 80,
    },
    unSelectedCell: {
        borderColor: '#c0c0c0',
        borderWidth: 0.5,
        borderRadius: 20,
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    unSelectedCellText: {
        fontSize: 15,
        color: '#c0c0c0',
        alignContent: 'center',
    },
});
