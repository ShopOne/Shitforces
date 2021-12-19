import { FormLabel, FormControl, Input, Checkbox } from '@chakra-ui/react';
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
      <form onSubmit={(e) => e.preventDefault()}>
        <FormControl>
          <FormLabel
            className="mr-2"
            htmlFor="contest-standings-table-form-username"
          >
            ユーザ名
          </FormLabel>
          <Input
            className="mr-2"
            id="contest-standings-table-form-username"
            onChange={changeAccountName}
            as={'input'}
            type="search"
            value={searchTerm}
          />
        </FormControl>
      </form>
    </div>
  );
};

export default SearchBar;
