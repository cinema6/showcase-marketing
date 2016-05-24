'use strict';

import React, { Component, PropTypes } from 'react';

import TokenTextField from "showcase/src/components/TokenTextField";
import AdPreview from "showcase/src/components/AdPreview";
import AppSearchItem from 'showcase/src/components/AppSearchItem';
import AppSearchToken from 'showcase/src/components/AppSearchToken';
import { assign } from 'lodash';
import { createInterstitialFactory } from 'showcase-core/dist/factories/app';

// Product Preview Props
const PREVIEW = {
    CARD_OPTIONS: {
        cardType: 'showcase-app'
    },
    PLACEMENT_OPTIONS: {
        type: 'mobile-card',
        branding: 'showcase-app--interstitial'
    }
};

function findProducts(find, query) {
    if (!query) { return Promise.resolve([]); }

    return find({ query, limit: 10 })
        .then(products => products.map(product => assign({}, product, {
            id: product.uri // Key products by their URI as it will be unique
        })))
        .catch(() => []);
}

export default class Marketing extends Component{
	constructor(){
		super(...arguments);
	}
	
	render(){	
		return(
		<div>
			//form start
			<form onSubmit={handleSubmit(this.onSubmit)}>	
				<TokenTextField 
					onChange = {handleChange} //TODO
	                maxValues={1}
	                TokenComponent={AppSearchToken}
	                SuggestionComponent={AppSearchItem}
	                getSuggestions={text => findProducts(this.props.findProducts, text)}
	                value={ ['']}
		        />
		    </form>
		    <AdPreview
		     	cardOptions={PREVIEW.CARD_OPTIONS}
			    placementOptions={PREVIEW.PLACEMENT_OPTIONS}
			    productData = {{name:"Filler name", description:"Filler Description"}}
			    factory={createInterstitialFactory}

		    ></AdPreview>
		</div>

			);
	}

}
//TODO: pass list to TokenTextField
function handleChange(e){

	function queryAppStore(input){
		fetch('https://platform-staging.reelcontent.com/api/public/search/apps?query==${input}')
		    .then(function(response) {
		        if (response.status >= 400) {
		            throw new Error("Bad response from server");
		        }
		        return response.json();
		    })
		    .then(function(appJSON) {
		       
		      //display data in suggestions

		    });
	}

}