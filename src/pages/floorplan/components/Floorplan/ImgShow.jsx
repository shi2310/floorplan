import React from 'react';
import PropTypes from 'prop-types';
import { Divider } from 'antd';
import styles from './ImgShow.less';

export default class ImgShow extends React.Component {
  render() {
    const { imgSrc } = this.props;
    return (
      <div className={styles.info}>
        <div className={styles.top}>
          <div />
          <div />
        </div>

        {imgSrc ? (
          <div className={styles.imageBox}>
            <img src={imgSrc} alt="floorplan" />
          </div>
        ) : (
          <Divider className={styles.divider} />
        )}

        <div className={styles.bottom}>
          <div />
        </div>
      </div>
    );
  }
}

ImgShow.propTypes = {
  imgSrc: PropTypes.string,
};
