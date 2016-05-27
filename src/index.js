'use strict';   
import ReactDOM from 'react-dom';
import React from 'react';
import Views from './Views';
(w => {
    if(!w){
        this.adWidget = function(ele) {
            ReactDOM.render(<Views></Views>, ele);
        };
    }else{
        w.adWidget = function(ele) {
            ReactDOM.render(<Views></Views>, ele);
        };
    }

    let parents = document.getElementsByClassName('ad-widget');
    for(let i = 0, len = parents.length; i < len; i++){
        ReactDOM.render(<Views></Views>, parents[i]); 
    }
  

})(window);