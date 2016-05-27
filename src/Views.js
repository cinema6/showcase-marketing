/* global process */

'use strict';
import React, { Component } from 'react';
import AppInput from './components/AppInput';
import AppAd from './components/AppAd';
// controls display of child components { AppInput , AppAd }
export default class Views extends Component {
    constructor(){
        super(...arguments);
        this.RC_ENV =  (process.env.RC_ENV === 'production') ? true : false;
        this.state = {
            value: {}
        };
        this.setValue = this.setValue.bind(this);
    }
    // updates View value state (app object)
    setValue(obj) {
        this.setState( {value: obj} );       
    }
    render(){
        return(
            <div>
                {(Object.keys(this.state.value).length != 0 ) ? 
                    <AppAd appObj={this.state.value} isProduction = {this.RC_ENV} />
                
                : 
                    <AppInput update = {this.setValue.bind(this)} isProduction = {this.RC_ENV} 
                    />
                }           
            </div>
        );
    }
}