'use strict';
import React, { Component, PropTypes } from 'react';
import TokenTextField from 'showcase/src/components/TokenTextField';
import AppSearchItem from 'showcase/src/components/AppSearchItem';
import AppSearchToken from 'showcase/src/components/AppSearchToken';
import { apiURL } from '../environment';


export default class AppInput extends Component {
    constructor(){
        super(...arguments);
        this.state = {
            appData : []
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
            <div className="create-ad step-1 col-md-6 col-md-offset-3 col-xs-12 text-center
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
                        <button type = "submit" className= "col-sm-6 col-sm-offset-3 col-xs-12 btn 
                        btn-danger btn-lg">
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
