'use strict';

import React from 'react';
import {
    View
} from 'react-native';

import VideoPlayer from '../../components/VideoPlayer';

export default class PlayTestScreen extends React.Component {
    render() {
        return (
            <View style={{flex: 1, backgroundColor: '#3d3d3d'}}>
                <VideoPlayer
                    ref={(ref) => this._player = ref}
                    onBackward={() => console.log('onBackward')}
                    video={{id: 16211,episode:1}}
                    //source={'http://192.168.3.31:8080/env'}
                    forceFullScreen={true}
                />
            </View>
        );
    }
}