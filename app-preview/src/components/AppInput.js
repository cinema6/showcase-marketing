'use strict';
import React, { Component, PropTypes } from 'react';
import TokenTextField from 'showcase/src/components/TokenTextField';
import AppSearchItem from 'showcase/src/components/AppSearchItem';
import AppSearchToken from 'showcase/src/components/AppSearchToken';
import classnames from 'classnames';
import { apiURL } from '../environment';
import { polyfill as promisePoly } from 'es6-promise';
import 'isomorphic-fetch';

promisePoly();

export default class AppInput extends Component {
    constructor(){
        super(...arguments);
        this.state = {
            appData : [],
            isSubmitting: false
        };
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.getSuggestions = this.getSuggestions.bind(this);
        this.getIDs = this.getIDs.bind(this);
        this.queryAppStore = this.queryAppStore.bind(this);
    }
    handleChange(val){
        // set state
        this.setState({appData : val});
    }
    handleSubmit(e){       
        e.preventDefault();
        try{
            // set URI in localStorage
            localStorage.setItem('appURI', this.state.appData[0].uri);
            this.toggleSubmit();
            fetch(`${apiURL}/collateral/product-data?uri=${this.state.appData[0].uri}`)
                .then((response) => {
                    if (response.status >= 400) {
                        throw new Error('Bad response from server');
                    }else if (response.status === 200){
                        response.json().then( e => {
                            this.props.onUpdate(e);
                        });
                    }
                });
        }catch(e){
            // clear local storage
            localStorage.clear();
        }
    }
    toggleSubmit(){
        this.setState({isSubmitting : !this.state.isSubmitting});
    }
    getSuggestions(text) {
        // empty/null -> return promise.resolve []
        return (text) ?    
            this.getIDs(text):
            Promise.resolve([]);
    }
    getIDs(text) {
        return(
            this.queryAppStore(text).then( objs => {
                //add id prop for TokenTextField
                for(let obj of objs){
                    obj.id = obj.uri;
                }
                return objs;
            })
        );
    }
    queryAppStore(input) {
        return (
            fetch(`${apiURL}/search/apps?query=${input}`)
                .then((response) => {
                    if (response.status >= 400) {
                        throw new Error('Bad response from server');
                    }
                    return response.json();
                })
        );
    }
    render() {
        return(
            <div className="create-ad step-1 text-center
            animated fadeIn">
                <h1 className="text-center"> {this.props.text.titleText} </h1>
                <form onSubmit = { this.handleSubmit } >   
                    <div className="app-search form-group text-center">
                        <TokenTextField
                            onChange = { this.handleChange }
                            maxValues = { 1 }
                            TokenComponent = { AppSearchToken }
                            SuggestionComponent = { AppSearchItem }
                            getSuggestions = { this.getSuggestions }
                            value = { this.state.appData } />
                        <span id="helpBlock" className="help-block">
                        {this.props.text.subtitleText}
                        </span>
                        <br />
                        <button 
                            disabled = {this.state.isSubmitting} 
                            type = "submit" 
                            className= {
                                classnames('btn', 'btn-danger', 'btn-lg', 
                                {'btn-waiting' : this.state.isSubmitting})}>
                            {this.props.text.buttonText}
                        </button>
                    </div>
                </form>
            </div>
        ); 
    }
}
AppInput.propTypes = {
    onUpdate: PropTypes.func.isRequired,
    text: PropTypes.object.isRequired
};
