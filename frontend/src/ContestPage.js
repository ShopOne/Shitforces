import React from "react";
import {Button, Tab, Tabs, Form, Table, Badge} from "react-bootstrap";
import {
  getContestInfo,
  getContestProblems,
  getRankingInfo,
  getSubmission,
  postSubmission
} from "./share-func/HttpRequest";
import PropTypes from 'prop-types';
import './ContestPage.css';
import getCookieArray from "./share-func/GetCookieArray";
import PagingElement from "./share-element/PagingElement";

// URL: /contest/$shortContestName
function createEnglishIndex(index, num) {
  const ALPHABETS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  const ALPHABETS_NUM = 26;
  let res = ALPHABETS[index % ALPHABETS_NUM];
  if (num > ALPHABETS_NUM) {
    res += index / ALPHABETS_NUM;
  }
  return res;
}
function getShortContestName() {
  const splitPath = window.location.pathname.split("/");
  return splitPath.slice(-1)[0];
}
function RankingTable(props) {
  const problemsNum = props.problems.length;
  const problemTr = () => {
    const items = [];
    for(let i = 0; i < problemsNum ; i++) {
      items.push(<th>{createEnglishIndex(i, problemsNum)}</th>);
    }
    return items;
  };
  const rankingInfo = () => {
    /**
     * @param {Object} account - 順位表に表示するためのアカウント情報
     * @param {String} account.accountName - アカウント名
     * @param {Array} account.acceptList - ACした問題リスト firstには問題インデックス、secondには時間
     * @param {ranking} account.ranking - このアカウントの現在順位
     * @param {Number} account.penalty - ペナルティ
     */
    return props.rankingList.map((account, idx) => {
      const probElement = [];
      let sumScore = 0;
      for(let i = 0; i < problemsNum ; i++) {
        if (account.acceptList.some(ac => ac.first === i)) {
          probElement.push(<td>AC</td>);
          sumScore++;
        } else {
          probElement.push(<td> </td>);
        }
      }
      return (
        <tr key={account.accountName + idx}>
          <td>{account.ranking}</td>
          <td>{account.accountName}</td>
          <td>{sumScore}</td>
          {probElement}
          <td>{account.penalty}</td>
        </tr>
      );
    });
  };
  return (
    <Table striped bordered hover>
      <thead>
        <tr>
          <th>順位</th>
          <th>アカウント</th>
          <th>総得点</th>
          {problemTr()}
          <th>ペナルティ</th>
        </tr>
      </thead>
      <tbody>
        {rankingInfo()}
      </tbody>
    </Table>
  );
}
RankingTable.propTypes = {
  rankingList: PropTypes.array,
  problems: PropTypes.array
};
class SubmissionTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      displaySubmissions: []
    };
    this.SUBMISSIONS_IN_ONE_PAGE = 5;
    this.pageNum = Math.ceil(props.submissions.length / this.SUBMISSIONS_IN_ONE_PAGE);
    this.changeDisplaySubmissions = this.changeDisplaySubmissions.bind(this);
    this.changeDisplaySubmissions(0);
  }

  changeDisplaySubmissions(page) {
    const newSubmissions = this.props.submissions.filter((_, idx) =>
      page * this.SUBMISSIONS_IN_ONE_PAGE <= idx && idx < (page + 1) * this.SUBMISSIONS_IN_ONE_PAGE);
    this.setState({
      displaySubmissions: newSubmissions
    });
  }
  tableBody() {
    /**
     * @param {Object} submit - 提出情報
     * @param {String} submit.statement - 提出した際の答案
     * @param {String} submit.result - 提出結果
     * @param {String} submit.submitTime - 提出時間のフォーマット済の文字列
     */
    return this.state.displaySubmissions.map((submit, idx) => {
      return(
        <tr key={idx}>
          <td>{createEnglishIndex(submit.indexOfContest, this.props.problemNum)}</td>
          <td>{submit.statement}</td>
          <td>{submit.result}</td>
          <td>{submit.submitTime}</td>
        </tr>
      );
    });
  }
  render() {
    return (
      <div>
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>問題</th>
              <th>提出</th>
              <th>結果</th>
              <th>提出時間</th>
            </tr>
          </thead>
          <tbody>
            {this.tableBody()}
          </tbody>
        </Table>
        <PagingElement pageNum={this.pageNum} pageChanged={this.changeDisplaySubmissions}/>
      </div>
    );
  }
}
SubmissionTable.propTypes = {
  submissions: PropTypes.array,
  problemNum: PropTypes.number
};
function SubmissionBudges(props) {
  const tryingArray = new Array(props.problemNum);
  tryingArray.fill("NO_SUB");
  props.submissions.map(submit => {
    if (submit.result === "ACCEPTED") {
      tryingArray[submit.indexOfContest] = "ACCEPTED";
    } else if (submit.result === "WRONG_ANSWER") {
      if (tryingArray[submit.indexOfContest] === "NO_SUB") {
        tryingArray[submit.indexOfContest] = "WRONG_ANSWER";
      }
    }
  });
  const tryingBudges = [];
  for (let i = 0; i < props.problemNum; i++) {
    let variant;
    const tryResult = tryingArray[i];
    if (tryResult === "ACCEPTED") {
      variant = "success";
    } else if (tryResult === "WRONG_ANSWER") {
      variant = "warning";
    } else {
      variant = "secondary";
    }
    const key = createEnglishIndex(i, props.problemNum);
    tryingBudges.push(<Badge key={key} variant={variant}>{key}</Badge>);
  }
  return (
    <div>
      {tryingBudges}
    </div>
  );
}
SubmissionBudges.propTypes = {
  submissions: PropTypes.array,
  problemNum: PropTypes.number
};
class RankingElement extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      page: 0,
      attendNum: 0,
      rankingList: [],
    };
    this.ACCOUNTS_IN_ONE_PAGE = 20;
    this.getRanking = this.getRanking.bind(this);
  }
  getRanking(page) {
    if (page === undefined) {
      page = this.state.page;
    }
    getRankingInfo(page, getShortContestName())
      .then((rankingInfo) => {
        this.setState({
          attendNum: rankingInfo.attendAccountNum,
          rankingList: rankingInfo.rankingList,
          ranking: rankingInfo.requestAccountRank
        });
      });
  }
  componentDidMount() {
    this.getRanking();
  }

  render() {
    const pageNum = Math.ceil(this.state.attendNum / this.ACCOUNTS_IN_ONE_PAGE);
    let rankingTable = <div/>;
    if (this.state.rankingList !== []) {
      rankingTable = <RankingTable problems={this.props.problems} rankingList={this.state.rankingList} />;
    }
    let myRank = "";
    if (this.state.ranking) {
      myRank = `順位: ${this.state.ranking}`;
    }
    return (
      <div>
        <p>{myRank}</p>
        {rankingTable}
        <PagingElement pageNum={pageNum} pageChanged={this.getRanking}/>
      </div>
    );
  }
}
RankingElement.propTypes = {
  problems: this.props.problems
};
class ProblemsTab extends React.Component {
  constructor(props) {
    super(props);
    this.answerInput = React.createRef();
    this.getSubmitFormOrHistory = this.getSubmitFormOrHistory.bind(this);
    this.submitAnswer = this.submitAnswer.bind(this);
    this.getProblemTabList = this.getProblemTabList.bind(this);
    this.mySubmissionKey = "mySubmit";
    this.state = {
      key: this.mySubmissionKey,
      problems: [],
      submissions: [],
      comment: "",
    };
    const cookieArray = getCookieArray();
    if (cookieArray["_sforce_account_name"]) {
      getSubmission(getShortContestName(), cookieArray["_sforce_account_name"])
        .then(res => {
          this.setState({
            submissions: res
          });
        });
    }
  }
  getSubmitFormOrHistory() {
    if (this.state.key !== this.mySubmissionKey) {
      return (
        <div>
          <Form.Label>答え</Form.Label>
          <Form.Control type={"text"} ref={this.answerInput} />
          <Button type={"primary"} onClick={this.submitAnswer}>提出</Button>
        </div>
      );
    } else if(this.state.submissions.length > 0) {
      return (
        <SubmissionTable submissions={this.state.submissions} problemNum={this.props.problems.length}/>
      );
    }
  }
  submitAnswer() {
    if (this.answerInput.current.value === "") {
      this.setState({comment: "答えが空です"});
      return;
    }
    if (this.answerInput.current.value.indexOf(':') !== -1) {
      this.setState({comment: ": を含む答えは提出できません"});
      return;
    }
    this.setState({
      comment: ""
    });
    postSubmission(getShortContestName(), this.state.key, this.answerInput.current.value)
      .then((submitResult) => {
        const newSubmissions = this.state.submissions.slice();
        newSubmissions.unshift(submitResult);
        this.setState({
          comment: submitResult.result,
          submissions: newSubmissions
        });
      })
      .catch((e) => {
        console.log(e);
        this.setState({
          comment: "提出に失敗しました"
        });
      });
  }
  getProblemTabList () {
    return this.props.problems.map((problem, index) => {
      let problemTitle = createEnglishIndex(index, this.props.problems.size);
      return (
        <Tab
          eventKey={index} key={problem.indexOfContest} title={problemTitle}>
          <p>{problem.statement}</p>
        </Tab>
      );
    });
  }
  render() {
    if (this.props.problems === []) {
      return <div/>;
    }
    let submissionBudge = <div/>;
    if (this.props.problems.length !== 0 && this.state.submissions !== []) {
      submissionBudge = <SubmissionBudges submissions={this.state.submissions} problemNum={this.props.problems.length} />;
    }
    return (
      <div>
        {submissionBudge}
        <Tabs
          activeKey={this.state.key}
          onSelect={(k) => this.setState({comment: "", key: k})}
          submissions={this.state.submissions}>
          {this.getProblemTabList()}
          <Tab
            eventKey={"mySubmit"} key={"mySubmit"} title={"自分の提出"}>
          </Tab>
        </Tabs>
        {this.getSubmitFormOrHistory()}
        <p>{this.state.comment}</p>
      </div>
    );
  }
}
ProblemsTab.propTypes = {
  problems: PropTypes.array,
  contestName: PropTypes.string
};


export class ContestPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      contestName: "",
      startTime: "",
      endTime: "",
      problems: [],
    };
  }
  componentDidMount() {
    getContestInfo(getShortContestName())
      .then((contest) => {
        this.setState({
          contestName: contest.name,
          statement: contest.statement,
          startTime: contest.startTime,
          endTime: contest.endTime
        });
        return getContestProblems(getShortContestName());
      })
      .then((problems) => {
        this.setState({
          problems: problems,
        });
      })
      .catch(() => this.setState({contestName: "コンテストが見つかりません"}));
  }

  render() {
    let problemsTab = <div />;
    let rankingElement = <div />;
    if (this.state.contestName !== "" && this.state.problems !== []) {
      problemsTab = <ProblemsTab problems={this.state.problems} contestName={this.state.contestName}/>;
      rankingElement = <RankingElement problems={this.state.problems}/>;
    }
    return(
      <div>
        <p id={"contestPage-contestName"}>{this.state.contestName}</p>
        <p><pre>{this.state.statement}</pre></p>
        <p id={"contestPage-timeSpan"}>{`${this.state.startTime} ~ ${this.state.endTime}`}</p>
        {problemsTab}
        {rankingElement}
      </div>
    );
  }
}
