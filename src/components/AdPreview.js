import React, { Component, PropTypes } from 'react';
import { Player } from 'c6embed';
import { defaults, debounce, isEqual } from 'lodash';

const PLAYER_STYLES = {
    position: 'absolute',
    top: '0px',
    left: '0px',
    width: '100%',
    height: '100%',
    zIndex: 'auto'
};

export default class AdPreview extends Component {
    constructor() {
        super(...arguments);

        this.createPlayerDebounced = debounce(this.createPlayer.bind(this), 250);
    }

    createPlayer(props = this.props) {
        const {
            refs: { root },
            player
        } = this;
        const {
            cardOptions,
            placementOptions,
            productData,
            factory
        } = props;
        const { type } = placementOptions;

        if (player) {
            root.removeChild(player.frame);
        }

        if (!productData) { return this.player = null; }

        this.player = new Player(`/api/public/players/${type}`, defaults({
            mobileType: type,
            preview: true,
            container: 'showcase',
            context: 'showcase'
        }, placementOptions), {
            experience: {
                id: 'e-showcase_preview',
                data: {
                    campaign: {},
                    collateral: {},
                    params: {},
                    links: {},
                    deck: [factory(cardOptions)(productData)]
                }
            }
        });

        this.player.bootstrap(root, PLAYER_STYLES).then(player => player.show());
    }

    componentDidMount() {
        this.createPlayer();
    }

    componentWillReceiveProps(nextProps) {
        if (isEqual(nextProps.productData, this.props.productData)) { return; }

        this.createPlayerDebounced(nextProps);
    }

    render() {
        return (<div
            className="create-ad step-2 col-md-6 col-sm-12 col-xs-12 col-middle text-center">
            <div className="phone-wrap">
                <div ref="root" className="phone-frame">
                </div>
            </div>
        </div>);
    }

    shouldComponentUpdate() {
        return false;
    }

    componentWillUnmount() {
        this.createPlayerDebounced.cancel();
        this.player = null;
    }
}
AdPreview.propTypes = {
    cardOptions: PropTypes.object.isRequired,
    placementOptions: PropTypes.shape({
        type: PropTypes.string.isRequired
    }).isRequired,
    productData: PropTypes.object,
    factory: PropTypes.func.isRequired
};
