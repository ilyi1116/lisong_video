import React, { Component } from 'react'
import {
    TouchableOpacity,
    View,
    Image,
    Dimensions
} from 'react-native'
import Swiper from 'react-native-swiper'
import PropTypes from 'prop-types';
const { width } = Dimensions.get('window')
const loading = require('./imgs/loading.gif')

const styles = {
    wrapper: {
    },

    slide: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: 'transparent'
    },
    image: {
        width,
        flex: 1,
        backgroundColor: 'transparent'
    },

    loadingView: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,.5)'
    },

    loadingImage: {
        width: 60,
        height: 60
    }
}

const Slide = props => {
    return (
        <TouchableOpacity style={styles.slide} onPress={props.onClickBanner.bind(null, props.item)} activeOpacity={1}>
            <Image onLoad={props.loadHandle.bind(null, props.i)} style={styles.image} source={{uri: props.uri}} />
            {
                !props.loaded && <View style={styles.loadingView}>
                    <Image style={styles.loadingImage} source={loading} />
                </View>
            }
        </TouchableOpacity>
    )
}

export default class LoadMinimalSwiper extends Component {
    static propTypes = {
        banners:PropTypes.any,
        loadQueue:PropTypes.arrayOf(PropTypes.number),
        selfHeight: PropTypes.number
    }
    static defaultProps = {
        loadQueue: [],
        selfHeight: 150
    }

    constructor (props) {
        super(props)
        this.state = {

            loadQueue: []
        }
        this.loadHandle = this.loadHandle.bind(this)
    }
    loadHandle (i) {
        let loadQueue = this.state.loadQueue
        loadQueue[i] = 1
        this.setState({
            loadQueue
        })
    }
    onClickBanner = (item) =>{
        this.props.navigation.navigate('MoviePlayScreen', { code : item.hexId, episode: 1});
    }
    render () {
        let selfHeight = this.props.selfHeight;
        let emptyData = !this.props.banners || !this.props.banners.data || this.props.banners.data.length === 0;
            return (
                <View style={{height:selfHeight}}>
                    {
                        !emptyData && <Swiper loadMinimalSize={1} style={styles.wrapper} loop={false}>
                            {
                                this.props.banners.data.map((item, i) =>
                                    <Slide
                                        loadHandle={this.loadHandle}
                                        loaded={!!this.state.loadQueue[i]}
                                        uri={item.cover}
                                        i={i}
                                        item={item}
                                        key={i}
                                        onClickBanner={this.onClickBanner}/>
                                )
                            }
                        </Swiper>
                    }
                </View>
            );

    }
}