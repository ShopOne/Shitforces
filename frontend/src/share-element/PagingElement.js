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
    let loadPage = this.state.page;
    if (!isNaN(newPage)) {
      this.setState({
        page: newPage
      });
      loadPage = newPage;
    }
    this.props.pageChanged(loadPage);
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
    let reloadButton = <div/>;
    if (this.props.reloadButton === true) {
      reloadButton =
        <button
          type={"submit"}
          onClick={this.clicked}>
          <img src={window.location.origin + "/reload.png"} alt={"再読込"}/>
        </button>;
    }
    return (
      <div>
        <Pagination>{items}</Pagination>
        {reloadButton}
      </div>
    );
  }
}
PagingElement.propTypes = {
  pageNum: PropTypes.number,
  pageChanged: PropTypes.func,
  reloadButton: PropTypes.bool
};
