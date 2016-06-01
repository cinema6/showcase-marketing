'use strict';
import React, { Component } from 'react';
import AppInput from './components/AppInput';
import AppAd from './components/AppAd';

// controls display of child components { AppInput , AppAd }
export default class Views extends Component {
    constructor(){
        super(...arguments);
        this.state = {
            value: null
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
                { ( this.state.value !== null ) ? 
                    <AppAd appObj={this.state.value} />
                    :
                    <AppInput onUpdate = {this.setValue} />
                }           
            </div>
        );
    }
}