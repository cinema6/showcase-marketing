'use strict';   
import ReactDOM from 'react-dom';
import React from 'react';
import Views from './Views';

export function render(ele) {
    ReactDOM.render(<Views></Views>, ele);
}