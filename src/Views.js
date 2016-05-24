'use strict';

import React, { Component, PropTypes } from 'react';
import Marketing from "./components/Marketing";

export default class Views extends Component{
	constructor(){
		super(...arguments);
	}
	render(){
		return(
			<div>
				<Marketing></Marketing>
			</div>
		);
	}

}