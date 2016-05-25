'use strict';

import React, { Component, PropTypes } from 'react';

import TokenTextField from "showcase/src/components/TokenTextField";
import AdPreview from "showcase/src/components/AdPreview";
import AppSearchItem from 'showcase/src/components/AppSearchItem';
import AppSearchToken from 'showcase/src/components/AppSearchToken';
import { assign } from 'lodash';
import { createInterstitialFactory } from 'showcase-core/dist/factories/app';

const PREVIEW = {
    CARD_OPTIONS: {
        cardType: 'showcase-app'
    },
    PLACEMENT_OPTIONS: {
        type: 'mobile-card',
        branding: 'showcase-app--interstitial'
    }
};
export default class AppInput extends Component{
	constructor(){
		super(...arguments);
		this.state = {
			value : []
		};
	}
	render(){	
		return(
			<div>
				<form onSubmit={handleSubmit(this.onSubmit)}>	
					<TokenTextField
						onChange = { handleChange.bind(this) }
		                maxValues = { 1 }
		                TokenComponent = { AppSearchToken }
		                SuggestionComponent = { AppSearchItem }
		                getSuggestions = { getSuggestions }
		                value = { this.state.value } />
			    </form>
			</div>
		);
	}
}
function handleChange(val){
		this.setState({value : val});
}

function handleSubmit(e){

/*
	AdPreview.propTypes = {
    cardOptions: PropTypes.object.isRequired,
    placementOptions: PropTypes.shape({
        type: PropTypes.string.isRequired
    }).isRequired,
    productData: PropTypes.object,
    factory: PropTypes.func.isRequired
};
*/
/*	function loadPreview( data , parentNode){
		<AdPreview
			     	cardOptions={PREVIEW.CARD_OPTIONS}
				    placementOptions={PREVIEW.PLACEMENT_OPTIONS}
				    productData = {data}
				    factory={createInterstitialFactory}

			    ></AdPreview>);
	}*/

}
function getSuggestions(val){
	// empty/null -> return promise.resolve []
	return (val) ?    
		getURIS(val):
		Promise.resolve([]);
}
function getURIS(val){	
	return(
		queryAppStore(val).then(function(arr){
			let objs = arr;
			//add id prop for TokenTextField
			for(let obj of objs){
				obj.id = obj.uri;
			}
			return objs;
		}).catch(function(e){console.log(e);})
	);
}
function queryAppStore(input){
	return (fetch(`https://platform-staging.reelcontent.com/api/public/search/apps?query=${input}`)
		    .then(function(response) {
		        if (response.status >= 400) {
		            throw new Error("Bad response from server");
		        }
		        return response.json();
		    })
	);
}