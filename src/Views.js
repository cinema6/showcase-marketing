'use strict';
import React, { Component, PropTypes } from 'react';
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
        this.props.emitter.emit('showPreview', obj);
        this.setState( {value: obj} );       
    }
    render(){
        return(
            <div>
                { ( this.state.value !== null ) ? 
                    <AppAd 
                        appObj={this.state.value} 
                        showLoadingAnimation = {this.props.options.showLoadingAnimation}
                        interval = {this.props.options.interval} />
                    :
                    <AppInput 
                        onUpdate = {this.setValue} 
                        text={{ titleText: this.props.options.titleText, 
                                subtitleText: this.props.options.subtitleText, 
                                buttonText: this.props.options.buttonText}} />
                }           
            </div>
        );
    }
}

Views.propTypes = {
    options: PropTypes.object.isRequired,
    emitter: PropTypes.object.isRequired
};