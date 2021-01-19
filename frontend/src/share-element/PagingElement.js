import React from "react";
import PropTypes from 'prop-types';
import {Pagination} from "react-bootstrap";
export default class PagingElement extends React.Component {
  constructor(props) {
    super(props);
    this.props.pageChanged(0);
    this.state = {
      page: 0
    };
    this.clicked = this.clicked.bind(this);
  }
  clicked(event) {
    const newPage = parseInt(event.target.text) - 1;
    if (isNaN(newPage)) {
      return;
    }
    this.setState({
      page: newPage
    });
    this.props.pageChanged(newPage);
  }
  render() {
    const items = [];
    for(let i = 0; i < this.props.pageNum; i++) {
      items.push(
        <Pagination.Item key={i} active={i === this.state.page} onClick={this.clicked}>
          {i + 1}
        </Pagination.Item>
      );
    }
    return (
      <div>
        <Pagination>{items}</Pagination>
      </div>
    );
  }
}
PagingElement.propTypes = {
  pageNum: PropTypes.number,
  pageChanged: PropTypes.func
};
