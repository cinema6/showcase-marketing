'use strict';

import React, { Component, PropTypes } from 'react';
import { times } from 'lodash';
import classnames from 'classnames';

class AppRating extends Component {
    render() {
        const {
            rating
        } = this.props;

        return (<span className="app-rating">
            {times(5, index => {
                const star = index + 1;
                const halfStar = index + 0.5;

                return <i key={star} className={classnames('fa', {
                    'fa-star': rating >= star,
                    'fa-star-o': rating < halfStar,
                    'fa-star-half-o': rating === halfStar
                })} />;
            })}
        </span>);
    }
}

AppRating.propTypes = {
    rating: PropTypes.number.isRequired
};

export default class AppSearchItem extends Component {
    render() {
        const {
            suggestion: {
                title,
                developer,
                thumbnail,
                price,
                rating
            }
        } = this.props;

        return (<span>
            <div className="app-icon">
                <img src={thumbnail} />
            </div>
            <div className="app-info">
                <h4 className="app-title">{title}</h4>
                <span className="app-author"> By {developer} </span>
                {rating && (<AppRating rating={rating} />)}
                <span className="app-cost"> {price} </span>
            </div>
        </span>);
    }
}

AppSearchItem.propTypes = {
    suggestion: PropTypes.object,
    active: PropTypes.bool
};
