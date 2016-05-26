'use strict';
import React, { Component, PropTypes } from 'react';
import { createInterstitialFactory } from 'showcase-core/dist/factories/app';
import AdPreview from "showcase/src/components/AdPreview";

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

		this.state = {
			data: this.props.appObj
		}
		
	}	
	render(){
		return(
		<AdPreview
	     	cardOptions={PREVIEW.CARD_OPTIONS}
		    placementOptions={PREVIEW.PLACEMENT_OPTIONS}
		    productData = {this.state.data}
		    factory={createInterstitialFactory}	
		    apiRoot= {"https://platform-staging.reelcontent.com/"}

		    />
		);
	}
} 	

AppAd.propTypes = {
    appObj: PropTypes.object.isRequired
};