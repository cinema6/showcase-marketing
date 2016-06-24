'use strict';   
import ReactDOM from 'react-dom';
import React from 'react';
import Views from './Views';
import { EventEmitter } from 'events';

export function render(ele, {
    titleText = 'Promote your app',
    subtitleText = 'Search for your App on iTunes', 
    buttonText = 'Preview', 
    showLoadingAnimation = true,
	interval = 3
	}) {
    const emitter = new EventEmitter();

    ReactDOM.render(<Views
        emitter = {emitter}
        options = {{titleText, subtitleText, buttonText, showLoadingAnimation, interval}} >
        </Views>, ele);

    return emitter;
}