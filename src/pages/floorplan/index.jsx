import React, { PureComponent } from 'react';
import { connect } from 'dva';
import _ from 'lodash';
import Map from 'components/Map';
import { initMap, resetFocusBuilding, getFocusBuilding } from 'utils/buildings';
import FloatTools from 'components/FloatTools';
import Floorplan from './components/Floorplan';
import styles from './style.less';

@connect(({ editor }) => ({
  ...editor,
}))
class FloorPlan extends PureComponent {
  map = null;

  constructor(props) {
    super(props);
    this.state = {
      buildingId: 0,
    };
  }

  onMapLoaded = _map => {
    this.map = _map;
    initMap(this.map, buildingID => {
      // set state
      this.setState({ buildingId: _.toNumber(buildingID) });
    });
    const focusBuilding = getFocusBuilding() || {};
    if (focusBuilding.buildingID) {
      this.setState({ buildingId: _.toNumber(focusBuilding.buildingID) });
    }
  };

  onClose = () => {
    resetFocusBuilding();
    this.setState({ buildingId: 0 });
  };

  render() {
    const { buildingId } = this.state;
    return (
      <>
        <Map onLoaded={this.onMapLoaded} />
        <div className={styles.dialog}>
          {buildingId > 0 && this.map ? (
            <FloatTools buildingID={buildingId} closeDialog={this.onClose}>
              <Floorplan buildingID={buildingId} map={this.map} />
            </FloatTools>
          ) : null}
        </div>
      </>
    );
  }
}

export default FloorPlan;
