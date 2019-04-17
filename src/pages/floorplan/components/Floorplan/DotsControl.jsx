import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { Row, Col } from 'antd';
import EditLabel from './EditLabel';
import styles from './DotsControl.less';

const colorTable = {
  lt: 'red',
  rt: 'blue',
  rb: 'yellow',
};

export default class DotsControl extends React.Component {
  render() {
    const { dots, callback } = this.props;
    return dots ? (
      <>
        <Row className={styles.hrow}>
          <Col span={24} className={styles.col}>
            坐标定位
          </Col>
        </Row>
        {_.map(dots, (dot, key) => (
          <Row justify="center" key={key} className={styles.row}>
            <Col span={2} className={styles.col}>
              <div className={styles.point} style={{ backgroundColor: colorTable[key] }} />
            </Col>
            <Col span={11} className={styles.col}>
              <EditLabel
                initialValue={_.floor(_.toNumber(dot.lat), 7)}
                save={value => {
                  callback(key, { lat: _.floor(_.toNumber(value), 7) });
                }}
              />
            </Col>
            <Col span={11} className={styles.col}>
              <EditLabel
                initialValue={_.floor(_.toNumber(dot.lng), 7)}
                save={value => {
                  callback(key, { lng: _.floor(_.toNumber(value), 7) });
                }}
              />
            </Col>
          </Row>
        ))}
      </>
    ) : null;
  }
}

DotsControl.propTypes = {
  dots: PropTypes.object.isRequired,
  callback: PropTypes.func.isRequired,
};
