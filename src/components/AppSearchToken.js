import React, { Component, PropTypes } from 'react';

export default class AppSearchToken extends Component {
    render() {
        const {
            token: {
                title,
                thumbnail
            }
        } = this.props;

        return (<div className="app-selected">
            <img src={thumbnail} /> 
            <h4 className="app-title">{title}</h4>
        </div>);
    }
}

AppSearchToken.propTypes = {
    token: PropTypes.shape({
        title: PropTypes.string.isRequired,
        thumbnail: PropTypes.string.isRequired
    }).isRequired
};
