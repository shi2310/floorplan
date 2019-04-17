import React from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { Upload, Button, Spin, message } from 'antd';
import styles from './Upload.less';

export default class UploadControl extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      uploading: false,
    };
  }

  beforeUpload = file => {
    const imgTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    const isJPG = _.includes(imgTypes, file.type);
    if (!isJPG) {
      message.error('仅允许上传的文件类型JPG,JPEG,PNG!');
    }
    const isLt20M = file.size / 1024 / 1024 < 20;
    if (!isLt20M) {
      message.error('文件大小不能超过20MB!');
    }
    if (isJPG && isLt20M) {
      this.getBase64(file);
    }
    return false;
  };

  getBase64 = img => {
    this.setState({ uploading: true });
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      this.setState({
        uploading: false,
      });

      // fire parent callback
      this.props.callback(reader.result);
    });
    reader.readAsDataURL(img);
  };

  render() {
    return (
      <Upload
        name="file"
        showUploadList={false}
        listType="picture"
        beforeUpload={this.beforeUpload}
      >
        <Button className={styles.btn}>
          <Spin spinning={this.state.uploading}>选择底图</Spin>
        </Button>
      </Upload>
    );
  }
}

UploadControl.propTypes = {
  callback: PropTypes.func.isRequired,
};
