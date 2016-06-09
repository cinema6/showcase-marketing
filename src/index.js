'use strict';   
import ReactDOM from 'react-dom';
import React from 'react';
import Views from './Views';

export function render(ele, {
    titleText = 'Promote your app',
    subtitleText = 'Search for your App on iTunes', 
    buttonText = 'Preview', 
    showLoadingAnimation = true,
	interval = 3
	}) {
    ReactDOM.render(<Views 
        options = {{titleText, subtitleText, buttonText, showLoadingAnimation, interval}} >
        </Views>, ele);
}