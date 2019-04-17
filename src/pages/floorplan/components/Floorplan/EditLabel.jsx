import React from 'react';
import PropTypes from 'prop-types';
import { Input } from 'antd';

export default class EditableLabel extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      view: 'label',
      value: props.initialValue,
      previous: props.initialValue,
    };

    this.handleKeyUp = this.handleKeyUp.bind(this);
  }

  componentWillReceiveProps(next) {
    if (next.initialValue && next.initialValue !== this.props.initialValue) {
      this.setState({
        value: next.initialValue,
        previous: next.initialValue,
      });
    }
  }

  componentDidUpdate() {
    const { view } = this.state;
    if (view === 'text') {
      this.textInput.focus();
    }
  }

  switchView(view) {
    this.setState({
      view,
    });
  }

  changePrevious(previous) {
    return new Promise(resolve => {
      this.setState(
        {
          previous,
        },
        () => {
          resolve();
        }
      );
    });
  }

  changeValue(value) {
    return new Promise(resolve => {
      this.setState(
        {
          value,
        },
        () => {
          resolve();
        }
      );
    });
  }

  async handleKeyUp(e) {
    const { previous } = this.state;
    const { save } = this.props;

    e.persist();

    if (e.key === 'Escape') {
      await this.changeValue(previous);

      this.switchView('label');
    } else if (e.key === 'Enter') {
      await this.changeValue(e.target.value);
      await this.changePrevious(e.target.value);

      this.switchView('label');
      save(e.target.value);
    }
  }

  renderInput() {
    const { value } = this.state;
    const { save } = this.props;

    return (
      <div>
        <Input
          type="text"
          value={value}
          style={{ maxWidth: '142px', backgroundColor: 'transparent' }}
          ref={input => (this.textInput = input)}
          onChange={e => {
            this.changeValue(e.target.value);
          }}
          onBlur={e => {
            this.switchView('label');
            this.changePrevious(e.target.value);
            save(e.target.value);
          }}
          onKeyUp={this.handleKeyUp}
        />
      </div>
    );
  }

  renderLabel() {
    const { value } = this.state;
    return (
      <div>
        <span
          onClick={() => {
            this.switchView('text');
          }}
        >
          {value}
        </span>
      </div>
    );
  }

  render() {
    const { view } = this.state;
    return view === 'label' ? this.renderLabel() : this.renderInput();
  }
}

EditableLabel.propTypes = {
  initialValue: PropTypes.number,
  save: PropTypes.func.isRequired,
};
