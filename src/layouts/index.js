import React from 'react';
import { Helmet } from 'react-helmet';
import _ from 'lodash';
import config from 'config';
import styles from './index.less';

export default class BasicLayout extends React.PureComponent {
  getRoute = () => {
    const path = `${this.props.location.pathname}`.match(/^\/\w+\/?\D*/) || [];
    return _.trimEnd(path[0] || '', '/');
  };

  render() {
    const { children } = this.props;

    return (
      <div className={styles.box}>
        <Helmet>
          <title>{config.name}</title>
          <link rel="shortcut icon" href="favicon.png" />
        </Helmet>
        <div className={styles.layout}>
          <div className={styles.content}>{children}</div>
        </div>
      </div>
    );
  }
}
