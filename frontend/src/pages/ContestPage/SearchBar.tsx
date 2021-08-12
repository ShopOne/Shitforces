import { ChangeEvent, VFC } from 'react';
import { Form } from 'react-bootstrap';

type SearchBarProps = {
  changeAccountName: (event: ChangeEvent<HTMLInputElement>) => void;
  searchTerm: string;
};
const SearchBar: VFC<SearchBarProps> = ({ changeAccountName, searchTerm }) => {
  return (
    <div className="mb-4">
      {/* 通常enterkeyを押すとsubmitされるので、抑止する */}
      <Form inline onSubmit={(e) => e.preventDefault()}>
        <Form.Label
          className="mr-2"
          htmlFor="contest-standings-table-form-username"
        >
          ユーザ名
        </Form.Label>
        <Form.Control
          className="mr-2"
          id="contest-standings-table-form-username"
          onChange={changeAccountName}
          as={'input'}
          type="search"
          value={searchTerm}
        />
      </Form>
    </div>
  );
};

export default SearchBar;
