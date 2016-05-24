'use strict';

import React, { Component, PropTypes } from 'react';

import TokenTextField from "./TokenTextField";
import AppSearchItem from './AppSearchItem';
import AppSearchToken from './AppSearchToken';
import { assign } from 'lodash';

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
		this.state = {
			text: "Title"
		}
	}
	
	render(){	
		return(
		//form start
		<form onSubmit={handleSubmit(this.onSubmit)}>	
			<TokenTextField {...search}
                maxValues={1}
                TokenComponent={AppSearchToken}
                SuggestionComponent={AppSearchItem}
                getSuggestions={text => findProducts(this.props.findProducts, text)}
                value={search.value || []}
	        />
	    </form>

			);
	}

	this.propTypes = {

	}
}