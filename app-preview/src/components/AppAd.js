'use strict';
import React, { Component, PropTypes } from 'react';
import { createInterstitialFactory } from 'showcase-core/dist/factories/app';
import AdPreview from 'showcase/src/components/AdPreview';
import { apiURL } from '../environment';
import { assign } from 'lodash';

const PREVIEW = {
    CARD_OPTIONS: {
        cardType: 'showcase-app'
    },
    PLACEMENT_OPTIONS: {
        type: 'mobile-card',
        branding: 'showcase-app--interstitial'
    }
};

export default class AppAd extends Component{
    constructor(){
        super(...arguments);
    }
    render(){
        return(
        <AdPreview
            cardOptions = { assign({}, 
                                PREVIEW.CARD_OPTIONS, 
                                {advanceInterval: this.props.interval}) }
            placementOptions = {PREVIEW.PLACEMENT_OPTIONS}
            productData = {this.props.appObj}
            factory = {createInterstitialFactory} 
            apiRoot = {apiURL}
            showLoadingAnimation={this.props.showLoadingAnimation}
            loadDelay= { this.props.showLoadingAnimation ? 3000 : 0 }

            />
        );
    }
}   

AppAd.propTypes = {
    appObj: PropTypes.object.isRequired,
    showLoadingAnimation: PropTypes.bool.isRequired,
    interval: PropTypes.number.isRequired
};