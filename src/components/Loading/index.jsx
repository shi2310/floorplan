import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import style from './style.less';

class Loading extends PureComponent {
  render() {
    return this.props.spinning ? (
      <div className={style.spinner}>
        <div className={style.bounce1} />
        <div className={style.bounce2} />
        <div />
      </div>
    ) : null;
  }
}

Loading.propTypes = {
  spinning: PropTypes.bool,
};

export default Loading;
