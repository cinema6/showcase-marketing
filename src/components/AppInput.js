'use strict';
import React, { Component, PropTypes } from 'react';
import TokenTextField from "showcase/src/components/TokenTextField";
import AppSearchItem from 'showcase/src/components/AppSearchItem';
import AppSearchToken from 'showcase/src/components/AppSearchToken';

const inputStyles = {
						margin: 'auto',
						display: 'block',
						padding: '10px',
						listStyleType: 'none!important'
					 };
const buttonStyles = {
	margin: 'auto',
	display: 'inline-block',
	padding: '10px',
	width: '100%',
	textAlign: 'center'
};
export default class AppInput extends Component {
	constructor(){
		super(...arguments);
		this.state = {
			value : []
		};

		//this.handleChange = this.handleChange.bind(this);
		//this.getSuggestions = this.getSuggestions.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
		this.getIDs = this.getIDs.bind(this);
		this.queryAppStore = this.queryAppStore.bind(this);

	}
	handleChange(val){
		this.setState({value : val});
	}
	handleSubmit(e){
		e.preventDefault();
		console.log(this.state.value[0].uri);

		fetch(`http://apps-staging.reelcontent.com/api/public/collateral/product-data?uri=${this.state.value[0].uri}`)
		    .then((response) => {
		    	console.log(response);
		        if (response.status >= 400) {
		            throw new Error("Bad response from server");
		        }else if (response.status === 200){
		        	console.log(response.body);

		        	response.json().then(e=>{
		        		this.props.update(e);

		        	});
		        	
		   		}
		       	
		    });


	}
	getSuggestions(text) {
		// empty/null -> return promise.resolve []
		return (text) ?    
			this.getIDs(text):
			Promise.resolve([]);
	}
	getIDs(text) {
		return(
			this.queryAppStore(text).then( arr => {
				let objs = arr;
				//add id prop for TokenTextField
				for(let obj of objs){
					obj.id = obj.uri;
				}
				return objs;
			}).catch( e => console.log(e) )
		);
	}
	queryAppStore(input) {
		return (
			fetch(`https://platform-staging.reelcontent.com/api/public/search/apps?query=${input}`)
			    .then((response) => {
			        if (response.status >= 400) {
			            throw new Error("Bad response from server");
			        }
			        return response.json();
			    })
		);
	}
	render() {
		return(
			<div>
				<form onSubmit = {this.handleSubmit.bind(this)} >	
					<button type = "submit" style = {inputStyles, buttonStyles}	>Generate Preview</button>
					<TokenTextField
						style = {inputStyles}
						onChange = { this.handleChange.bind(this) }
		                maxValues = { 1 }
		                TokenComponent = { AppSearchToken }
		                SuggestionComponent = { AppSearchItem }
		                getSuggestions = { this.getSuggestions.bind(this) }
		                value = { this.state.value } />

		                
		           	
			    </form>
			</div>
		);
	}
}

AppInput.propTypes = {
	update: PropTypes.func.isRequired
};