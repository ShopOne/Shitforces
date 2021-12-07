import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { VFC } from 'react';
import { Line } from 'react-chartjs-2';
import { AccountContestPartHistory } from '../types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const options = {
  responsive: true,
  plugins: {
    legend: {
      display: false,
    },
    title: {
      display: true,
      text: 'レーティング遷移',
    },
  },
};

const createData = (results: AccountContestPartHistory[]) => ({
  labels: results.map(() => ''),
  datasets: [
    {
      label: '',
      data: results.map((result) => result.newRating),
      borderColor: '#888',
      backgroundColor: '#888',
    },
  ],
});

type Props = {
  contestResults: AccountContestPartHistory[];
};

export const RatingChart: VFC<Props> = ({ contestResults }) => (
  <Line options={options} data={createData(contestResults)} />
);
