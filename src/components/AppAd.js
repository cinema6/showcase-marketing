'use strict';
import React, { Component, PropTypes } from 'react';
import { createInterstitialFactory } from 'showcase-core/dist/factories/app';
import AdPreview from 'showcase/src/components/AdPreview';

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
        this.urls = {
            staging: 'https://platform-staging.reelcontent.com/',
            production: 'https://platform.reelcontent.com/'
        };
        
        this.apiURL = (this.props.isProduction) ? this.urls.production : this.urls.staging;
        this.state = {
            data: this.props.appObj
        };
        
    }   
    render(){
        return(
        <AdPreview
            cardOptions={PREVIEW.CARD_OPTIONS}
            placementOptions={PREVIEW.PLACEMENT_OPTIONS}
            productData = {this.state.data}
            factory={createInterstitialFactory} 
            apiRoot= {this.apiURL}

            />
        );
    }
}   

AppAd.propTypes = {
    appObj: PropTypes.object.isRequired,
    isProduction: PropTypes.bool.isRequired
};