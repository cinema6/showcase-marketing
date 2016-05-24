import React, { Component } from 'react';

export default class Input extends Component{
	constructor(){
		super();
		this.styles = {
			margin: 'auto',
			display: 'block',
			padding: '10px',
			width: '200px',
			borderRadius: '30px',
			fontFamily: 'helvetica'
		};
		this.default = "Enter Name";
	
	}
	changeHandler(event){
/*		const init = "Enter Name";
		//check for default
		if(event.target.value === init){

		}else if(event.target.value  === "" || event.target.value === null){
			event.target.value = init;
		}else{
			

		}*/

	}
	blurHandler(event){
		const init = this.default;
		//check for default
		if(event.target.value  === "" || event.target.value === null){
			event.target.value = init;
		}
	}
	focusHandler(event){
		const init = this.default;
		//check for default
		if(event.target.value === init){
			event.target.value = "";
		}
	}
	render(){

		return(<input 
				type = "text" 
				style = {this.styles} 
				value= {this.default}
				onChange = {this.changeHandler.bind(this)}
				onBlur = {this.blurHandler.bind(this)} 
				onFocus = {this.focusHandler.bind(this)} />);
	}
}