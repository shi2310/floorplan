import React from 'react';
import PropTypes from 'prop-types';
import { InputNumber, Button, Slider } from 'antd';
import { connect } from 'dva';
import { dataURItoBlob } from 'utils';
import _ from 'lodash';
import L from 'leaflet';
import { affineOverlay } from 'overlay';
import Loading from 'components/Loading';
import ImgShow from './imgShow';
import DotsControl from './dotsControl';
import UploadControl from './upload';
import styles from './index.less';

@connect(({ loading }) => ({
  submitLoading: loading.effects['floorplan/submit'],
}))
class Floorplan extends React.PureComponent {
  overlay = null;

  imgWidth = 0;

  imgHeight = 0;

  constructor(props) {
    super(props);
    this.state = {
      level: 1,
      opacity: 10,
      dots: {},
      imgSrc: null,
      imgLoading: false,
    };
  }

  componentDidUpdate(prevProps, prevState) {
    const { opacity, dots, imgSrc } = this.state;
    if (imgSrc && imgSrc !== prevState.imgSrc) this.initAffineOverlay(imgSrc);
    if (opacity !== prevState.opacity && this.overlay) this.overlay.setOpacity(opacity / 10);
    if (!_.isEmpty(dots) && !_.isEqual(dots, prevState.dots) && this.overlay) {
      _.map(dots, (dot, key) => {
        this.overlay.dotMoveByLatLng(key, dot.lat, dot.lng);
      });
    }
  }

  componentWillUnmount() {
    if (this.overlay) {
      this.overlay.remove();
    }
  }

  handleSubmit = e => {
    e.preventDefault();
    const { dots, level } = this.state;
    const { buildingID } = this.props;

    const formData = new FormData();
    formData.append('building_id', buildingID);
    formData.append('level', level);
    formData.append('gcp1', `0 0 ${dots.lt.lng} ${dots.lt.lat}`);
    formData.append('gcp2', `${this.imgWidth} 0 ${dots.rt.lng} ${dots.rt.lat}`);
    formData.append('gcp3', `${this.imgWidth} ${this.imgHeight} ${dots.rb.lng} ${dots.rb.lat}`);
    formData.append('file', dataURItoBlob(this.overlay.toDataURL()));

    this.props.dispatch({
      type: 'floorplan/submit',
      payload: formData,
    });
  };

  levelChange = value => {
    if (this.state.level !== value) {
      if (value === 0) {
        if (this.state.level > value) {
          value = -1;
        } else {
          value = 1;
        }
      }
      this.setState({ level: value });
    }
  };

  opacityChange = value => {
    this.setState({ opacity: value });
  };

  txtDotChange = (_key, payload) => {
    const { dots } = this.state;
    const _dots = { ...dots };
    const dot = _dots[_key];
    _dots[_key] = { ...dot, ...payload };
    this.setState({ dots: _dots });
  };

  initAffineOverlay = imgSrc => {
    const { opacity } = this.state;
    this.setState({ imgLoading: true });
    const image = new Image();
    image.src = imgSrc;
    image.onload = () => {
      this.imgWidth = image.width;
      this.imgHeight = image.height;
      if (this.overlay) this.overlay.removeChilds();
      this.overlay = affineOverlay(this.props.map, image);
      this.overlay.setOpacity(opacity / 10);
      const _dots = this.overlay.getDotsLatLng();
      this.setState({ dots: _dots });

      L.DomEvent.on(this.overlay, 'dotChange', ({ dot }) => {
        const currentDots = this.state.dots;
        const newDots = { ...currentDots, ...dot };
        this.setState({ dots: newDots });
      });

      this.setState({ imgLoading: false });
    };
  };

  render() {
    const { submitLoading } = this.props;
    const { opacity, imgSrc, dots, imgLoading } = this.state;
    return (
      <>
        <ImgShow imgSrc={imgSrc} />
        <div className={styles.floorUpload}>
          <InputNumber
            className={styles.number}
            min={-10}
            max={100}
            formatter={value => `${value}楼`}
            parser={value => value.replace('楼', '')}
            defaultValue={this.state.level}
            value={this.state.level}
            onChange={this.levelChange}
          />
          <UploadControl callback={src => this.setState({ imgSrc: src })} />
        </div>
        {!_.isEmpty(imgSrc) && (
          <>
            <Slider
              className={styles.slider}
              defaultValue={10}
              value={opacity}
              min={1}
              max={10}
              onChange={this.opacityChange}
              allowClear
            />
            {dots ? <DotsControl dots={dots} callback={this.txtDotChange.bind(this)} /> : null}
            <Button
              className={styles.submit}
              type="primary"
              block
              onClick={this.handleSubmit}
              loading={submitLoading}
            >
              保存
            </Button>
          </>
        )}
        <Loading spinning={imgLoading} />
      </>
    );
  }
}

Floorplan.propTypes = {
  buildingID: PropTypes.number.isRequired,
};
export default Floorplan;
