import { FC } from 'react';
import { Link } from 'react-router-dom';

export const Footer: FC = () => {
  return (
    <footer>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          paddingTop: '10px',
          paddingBottom: '10px',
          background: '#343a40',
        }}
      >
        <Link
          to={'/terms'}
          style={{
            marginRight: '10px',
            color: 'white',
          }}
        >
          利用規約
        </Link>
        <Link
          to={'/privacy-policy'}
          style={{
            marginLeft: '10px',
            color: 'white',
          }}
        >
          プライバシーポリシー
        </Link>
      </div>
    </footer>
  );
};
