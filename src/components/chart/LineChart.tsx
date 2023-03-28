import { Flex, Loader, Stack } from '@mantine/core';
import {
  Chart,
  ChartData,
  ChartOptions,
  Filler,
  LinearScale,
  LineElement,
  PointElement,
  TimeScale,
} from 'chart.js';
import 'chartjs-adapter-moment';
import { Line } from 'react-chartjs-2';

import { Activity } from 'src/utils/types';
import { Subheading3 } from '@components/typography';
import styles from './LineChart.module.scss';
import { CSSProperties, useEffect, useState } from 'react';
import { useMediaQuery } from '@mantine/hooks';

export interface GraphData {
  comment: Activity[];
  votes: Activity[];
}

interface IProps extends Partial<GraphData> {
  title: string;
  labels: { name: string; color: CSSProperties['color'] }[];
}

Chart.register(LinearScale, PointElement, LineElement, Filler, TimeScale);

const LineChart = (props: IProps) => {
  const hideYear = useMediaQuery('(max-width: 900px)');
  const hideMonth = useMediaQuery('(max-width: 500px)');

  useEffect(() => {
    if (hideMonth) setDay('DD');
    else if (hideYear) setDay('MM-DD');
    else setDay('yyyy-MM-DD');
  }, [hideYear, hideMonth]);

  const [day, setDay] = useState('yyyy-MM-DD');

  const options: ChartOptions<'line'> = {
    responsive: true,
    elements: { line: { cubicInterpolationMode: 'monotone' } },
    scales: {
      y: {
        position: 'right',
        ticks: {
          callback: function (value) {
            if (Number.isInteger(value)) {
              return value;
            }
          },
          stepSize: 1,
        },
      },
      x: {
        ticks: { display: true },
        type: 'time',
        display: true,
        position: 'bottom',
        time: { unit: 'day', displayFormats: { day } },
        min: new Date(Date.now() - 7 * 24 * 60 * 60 * 1e3)
          .toISOString()
          .split('T')[0],
        max: new Date().toISOString().split('T')[0],
      },
    },
  };

  const data: ChartData<'line'> = {
    datasets: [
      {
        label: props.labels[0].name,
        //@ts-ignore
        data: props?.votes?.map((day) => ({ x: day._id, y: day.count })),
        borderColor: props.labels[0].color,
        backgroundColor: props.labels[0].color,
        pointBackgroundColor: '#3751FF',
      },
      {
        label: props.labels[1].name,
        //@ts-ignore
        data: props?.comment?.map((day) => ({ x: day._id, y: day.count })),
        borderColor: props.labels[1].color,
      },
    ],
  };
  return (
    <Stack className={styles.container}>
      <Flex
        justify="space-between"
        mt="md"
        ml="md"
        gap="xs"
        direction={hideYear ? 'column' : 'row'}>
        <Subheading3>{props.title}</Subheading3>
        <Flex gap="sm">
          {props.labels.map((label, index) => (
            <Flex align="center" gap="sm" key={index}>
              <div
                className={styles.line}
                style={{ backgroundColor: label.color }}
              />
              <Subheading3>{label.name}</Subheading3>
            </Flex>
          ))}
        </Flex>
      </Flex>
      {!(props.comment && props.votes) ? (
        <Flex justify="center" align="center">
          <Loader color="violet" />
        </Flex>
      ) : (
        <Line options={options} data={data} />
      )}
    </Stack>
  );
};

export default LineChart;
