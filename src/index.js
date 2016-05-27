'use strict';   
import ReactDOM from 'react-dom';
import React from 'react';
import Views from './Views';
(w => {
    if(!w){
        this.appPreview = function(ele) {
            ReactDOM.render(<Views></Views>, ele);
        };
    }else{
        w.appPreview= function(ele) {
            ReactDOM.render(<Views></Views>, ele);
        };
    }
})(window);