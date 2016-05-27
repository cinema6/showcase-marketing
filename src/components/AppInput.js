'use strict';
import React, { Component, PropTypes } from 'react';
import TokenTextField from 'showcase/src/components/TokenTextField';
import AppSearchItem from 'showcase/src/components/AppSearchItem';
import AppSearchToken from 'showcase/src/components/AppSearchToken';

export default class AppInput extends Component {
    constructor(){
        super(...arguments);
        this.state = {
            value : []
        };
        this.apiURL = (this.props.isProduction) ? 
                    'https://platform.reelcontent.com/api/public':
                    'https://platform-staging.reelcontent.com/api/public';

        this.handleSubmit = this.handleSubmit.bind(this);
        this.getIDs = this.getIDs.bind(this);
        this.queryAppStore = this.queryAppStore.bind(this);
    }
    handleChange(val){
        this.setState({value : val});
    }
    handleSubmit(e){
        e.preventDefault();
        fetch(`${this.apiURL}/collateral/product-data?uri=${this.state.value[0].uri}`)
            .then((response) => {
                if (response.status >= 400) {
                    throw new Error('Bad response from server');
                }else if (response.status === 200){
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
            })
        );
    }
    queryAppStore(input) {
        return (
            fetch(`${this.apiURL}/search/apps?query=${input}`)
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
            <div>
                <form onSubmit = {this.handleSubmit.bind(this)} >   
                    <TokenTextField
                        onChange = { this.handleChange.bind(this) }
                        maxValues = { 1 }
                        TokenComponent = { AppSearchToken }
                        SuggestionComponent = { AppSearchItem }
                        getSuggestions = { this.getSuggestions.bind(this) }
                        value = { this.state.value } />
                    <button type = 'submit'>Generate Preview</button>
                </form>
            </div>
        );
    }
}
AppInput.propTypes = {
    update: PropTypes.func.isRequired,
    isProduction : PropTypes.bool.isRequired
};