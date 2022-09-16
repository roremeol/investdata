import React, { useState, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';

import grafStyle from '../styles/graf.module.scss'

export default function StockPriceChart({ tabs=[], dataset={} }) {

  const { headers=[], data=[], formatter=(v) => v } = dataset;

  const options = {
      grid: { top: 8, right: 8, bottom: 24, left: 68 },
      tooltip: {
        trigger: 'axis',
        formatter: (params) => formatter(params[0].value),
        axisPointer: {
          animation: false,
          type: 'cross',
          lineStyle: {
            color: '#8392A5'
          }
        }
      },
      xAxis: {
        type: 'category',
        data: headers,
      },
      yAxis: {
        type: 'value',
        data: data,
        scale: true,
        axisLine: { lineStyle: { color: '#8392A5' } },
        splitLine: { show: true },
        axisLabel: {
          formatter
        }
      },
      series: [
        {
          data: data,
          type: 'line',
          smooth: true,
          itemStyle: {
            color: 'hsl(0deg, 0%, 21%)',
          }
        },
      ]
  };

  const onTabClick=(index=0,cb=null) => {
    setState({tabVersion:index,tabIndex:index})

    if(typeof cb=='function')
      cb(tabs[index]);
  }

  const onChartClick=(params) => {
    console.log('onChartClick:',params)
  }

  const onChartLegendselectchanged=(params) => {
    console.log('onChartLegendselectchanged:',params)
  }

  const onEvents = {
    'click': onChartClick,
    'legendselectchanged': onChartLegendselectchanged
  }

  const [state, setState] = useState({tabVersion:0,tabIndex:-1})

  useEffect(() => {
    setState({
      ...state,
      tabIndex:tabs.findIndex(({active}) => active)
    })
  },[])

  return (
      <>
        {tabs.length > 0 &&
        <div className={["tabs",grafStyle.tabs].join(' ')}>
            <ul key={state.tabVersion} data-verstion={state.tabVersion}>
              {tabs.map( ({title='',onClick=null},index) =>
                <li key={index} data-selected={state.tabVersion} className={((state.tabIndex===index) && "is-active")  || 'is-no_oactive'}>
                    <a onClick={() => onTabClick(index,onClick)}>{title}</a>
                </li>
              )}
            </ul>
        </div>
        }
        <ReactECharts onEvents={onEvents} data-verstion={state.tabVersion} className={grafStyle.graf} option={options} />
      </>
  );
}