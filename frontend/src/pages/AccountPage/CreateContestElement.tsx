import { VFC, useRef, useState, ChangeEvent } from 'react';
import { Form, Col, InputGroup, Button } from 'react-bootstrap';
import { ADMINISTRATOR } from '../../constants';
import {
  getAccountInformation,
  createContest,
} from '../../functions/HttpRequest';
import { getCookie } from '../../functions/getCookie';

export const CreateContestElement: VFC = () => {
  class ContestCreator {
    accountName: string;
    position: string;
    id: number;
    constructor(accountName: string, position: string, id: number) {
      this.accountName = accountName;
      this.position = position;
      this.id = id;
    }
  }
  const contestIdRef = useRef<HTMLInputElement>(null);
  const contestNameRef = useRef<HTMLInputElement>(null);
  const ratedBoundRef = useRef<HTMLInputElement>(null);
  const penaltyRef = useRef<HTMLInputElement>(null);
  const startTimeRef = useRef<HTMLInputElement>(null);
  const endTimeRef = useRef<HTMLInputElement>(null);
  const [contestType, setContestType] = useState<string>('AtCoder');
  const initCreatorArray = [new ContestCreator('', 'Coordinator', 0)];
  const [creatorList, setCreatorList] = useState<Array<ContestCreator>>(
    initCreatorArray
  );
  const submitNewContest = async () => {
    const cookieArray = getCookie();
    const accountName = cookieArray['_sforce_account_name'];
    const { auth } = await getAccountInformation(accountName || '');
    if (auth !== ADMINISTRATOR) {
      alert('権限がありません');

      return;
    }
    const contestId = contestIdRef?.current?.value ?? null;
    const contestName = contestNameRef.current?.value;
    const ratedBound = parseInt(ratedBoundRef.current?.value ?? '');
    const penalty = parseInt(penaltyRef.current?.value ?? '');
    const contestStartTime = new Date(
      Date.parse(startTimeRef.current?.value ?? '')
    );
    const contestEndTime = new Date(
      Date.parse(endTimeRef.current?.value ?? '')
    );
    const adjustedCreatorList = creatorList
      .filter((creator) => creator.accountName !== '')
      .map((creator) => {
        return {
          accountName: creator.accountName,
          contestId: contestId,
          position: creator.position,
        };
      });
    if (
      !contestId ||
      !contestName ||
      isNaN(ratedBound) ||
      isNaN(penalty) ||
      !contestType ||
      !contestStartTime ||
      !contestEndTime
    ) {
      alert('不正な入力があります');

      return;
    }
    if (
      adjustedCreatorList.filter(
        (creator) => creator.position === 'Coordinator'
      ).length === 0
    ) {
      alert('最低一人Coordinatorを指定して下さい');

      return;
    }
    createContest(
      contestId,
      contestName,
      new Date(contestStartTime),
      new Date(contestEndTime),
      penalty,
      ratedBound,
      contestType.toString(),
      adjustedCreatorList
    )
      .then(() => {
        alert('コンテストの作成に成功しました');
        window.location.href = '/';
      })
      .catch(() => {
        alert('コンテストの作成に失敗しました');
      });
  };
  const creatorsFormRows = () => {
    const addNewCreator = () => {
      const newCreatorList = creatorList.slice();
      const newId = creatorList[creatorList.length - 1].id + 1;
      newCreatorList.push(new ContestCreator('', 'Coordinator', newId));
      setCreatorList(newCreatorList);
    };
    const eraseCreator = (index: number) => {
      if (index === 0) return;
      const newCreatorList = creatorList.slice();
      newCreatorList.splice(index, 1);
      setCreatorList(newCreatorList);
    };
    const changeName = (newName: string, idx: number) => {
      const newCreatorList = creatorList.slice();
      newCreatorList[idx].accountName = newName;
      setCreatorList(newCreatorList);
    };
    const changePosition = (newPosition: string, idx: number) => {
      const newCreatorList = creatorList.slice();
      newCreatorList[idx].position = newPosition;
      setCreatorList(newCreatorList);
    };

    return (
      <div>
        <label>コンテスト関係者</label>
        {creatorList.map((creator, idx) => (
          <Form.Row key={creator.id}>
            <Col>
              <InputGroup className={'mb-3'}>
                <Form.Control
                  placeholder={'shop_one'}
                  onChange={(e) => changeName(e.target.value, idx)}
                />
              </InputGroup>
            </Col>
            <Col>
              <Form.Group
                controlId={'creatorPosition'}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  changePosition(e.target.value, idx)
                }
              >
                <Form.Control as={'select'}>
                  <option>Coordinator</option>
                  <option>Writer</option>
                </Form.Control>
              </Form.Group>
            </Col>
            <Col>
              <button type={'button'} onClick={addNewCreator}>
                +
              </button>
              <button type={'button'} onClick={() => eraseCreator(idx)}>
                -
              </button>
            </Col>
          </Form.Row>
        ))}
      </div>
    );
  };

  return (
    <div>
      <Form.Row>
        <Col>
          <label>コンテストID</label>
          <InputGroup className={'mb-3'}>
            <Form.Control placeholder={'kbc001'} ref={contestIdRef} />
          </InputGroup>
        </Col>
        <Col>
          <label>コンテスト名</label>
          <InputGroup className={'mb-3'}>
            <Form.Control
              placeholder={'くそなぞなぞBeginnerContest001'}
              ref={contestNameRef}
            />
          </InputGroup>
        </Col>
      </Form.Row>
      <Form.Row>
        <Col>
          <label>開始日時</label>
          <InputGroup className={'mb-3'}>
            <Form.Control
              placeholder={'2021-1-10 21:00:00'}
              type="datetime-local"
              ref={startTimeRef}
              pattern="[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}"
              required
            />
          </InputGroup>
        </Col>
        <Col>
          <label>終了日時</label>
          <InputGroup className={'mb-3'}>
            <Form.Control
              placeholder={'2021-1-10 21:30:00'}
              type="datetime-local"
              ref={endTimeRef}
              pattern="[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}"
              required
            />
          </InputGroup>
        </Col>
      </Form.Row>
      <Form.Row>
        <Col>
          <label>レート上限</label>
          <InputGroup className={'mb-3'}>
            <Form.Control
              placeholder={'0'}
              aria-label={'ratedBound'}
              ref={ratedBoundRef}
              type={'number'}
            />
          </InputGroup>
        </Col>
        <Col>
          <label>ペナルティ</label>
          <InputGroup className={'mb-3'}>
            <Form.Control
              placeholder={'0'}
              aria-label={'penalty'}
              ref={penaltyRef}
              type={'number'}
            />
          </InputGroup>
        </Col>
        <Col>
          <InputGroup className={'mb-3'}>
            <Form>
              <Form.Label>コンテスト形式</Form.Label>
              <Form.Group
                controlId={'contestTypeForm'}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setContestType(e.target.value)
                }
              >
                <Form.Control as={'select'}>
                  <option>AtCoder</option>
                  <option>ICPC</option>
                  <option>RAID</option>
                </Form.Control>
              </Form.Group>
            </Form>
          </InputGroup>
        </Col>
      </Form.Row>
      {creatorsFormRows()}
      <Button variant={'primary'} onClick={submitNewContest}>
        コンテスト生成
      </Button>
    </div>
  );
};
