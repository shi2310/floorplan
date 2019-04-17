import React from 'react';
import PropTypes from 'prop-types';
import { Icon, Modal } from 'antd';
import styles from './index.less';

class FloatTools extends React.PureComponent {
  onClose = () => {
    Modal.confirm({
      title: '提示',
      content: '确定关闭？！',
      onOk: () => {
        // trigger parent fun
        this.props.closeDialog();
      },
    });
  };

  render() {
    const { buildingID } = this.props;
    return (
      <div className={styles.card}>
        <div className={styles.routeinfo}>
          <div className={styles.head}>
            <span>{`建筑编号 ： ${buildingID}`}</span>
            <Icon type="close" className={styles.iconClose} onClick={this.onClose} />
          </div>
          <div className={styles.infolist}>
            {React.Children.map(this.props.children, child => React.cloneElement(child))}
          </div>
        </div>
      </div>
    );
  }
}

FloatTools.propTypes = {
  buildingID: PropTypes.number.isRequired,
  closeDialog: PropTypes.func,
};

export default FloatTools;
