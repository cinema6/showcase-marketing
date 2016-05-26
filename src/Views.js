'use strict';
import React, { Component, PropTypes } from 'react';
import AppInput from "./components/AppInput";
import AppAd from "./components/AppAd";

const appStyles = {
	margin: "0",
	margin: 'auto',
	display: 'block',
	fontFamily: "helvetica",
	textAlign: "center",
	listStyleType: "none",
	width: '400px'
};


// controls display of child components { AppInput , AppAd }
export default class Views extends Component {
	constructor(){
		super(...arguments);
		this.state = {
			value: {},
			//step: 0,
		};
		this.setValue = this.setValue.bind(this);
	}
	// updates View value state (app object)
 	setValue(obj) {
		this.setState( {value: obj} );
 		console.log(this.state.value);
 		//this.setStep(1);
		 
	}
	// updates state.step { 0, 1 }
	setStep(num){
		( num === 0 || num === 1 ) ? this.setState( {step: num} ) : console.error("Invalid step number");
	}
	render(){
		return(
			<div style= {appStyles}>
				{(Object.keys(this.state.value).length != 0 ) ? <AppAd appObj={this.state.value} /> : <AppInput update = {this.setValue.bind(this)} />}
			</div>
		);
	}
}