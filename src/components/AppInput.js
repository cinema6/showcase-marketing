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
            <div className="create-ad step-1 col-md-6 col-md-offset-3 col-xs-12 text-center
            animated fadeIn">
                <h1 className="text-center">Promote your app</h1>
                <form onSubmit = {this.handleSubmit.bind(this)} >   
                    <div className="app-search form-group text-center">
                        <TokenTextField
                            onChange = { this.handleChange.bind(this) }
                            maxValues = { 1 }
                            TokenComponent = { AppSearchToken }
                            SuggestionComponent = { AppSearchItem }
                            getSuggestions = { this.getSuggestions.bind(this) }
                            value = { this.state.value } />
                        <span id="helpBlock" className="help-block">
                        Search for your app on iTunes
                        </span>
                        <br />
                        <button type = 'submit' className='col-sm-6 col-sm-offset-3 col-xs-12 btn 
                        btn-danger btn-lg'>
                        Generate Preview
                        </button>
                    </div>
                </form>
            </div>
        );
    }
}
AppInput.propTypes = {
    update: PropTypes.func.isRequired,
    isProduction : PropTypes.bool.isRequired
};