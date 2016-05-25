'use strict';

import React, { Component, PropTypes } from 'react';
import AppInput from "./components/AppInput";

export default class Views extends Component{
	constructor(){
		super(...arguments);
	}
	render(){
		return(
			<div>
				<AppInput/>
			
			</div>
		);
	}

}