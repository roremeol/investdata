import React from 'react';
import ReactECharts from 'echarts-for-react';

import { format } from '../lib/utils'
import grafStyle from '../styles/graf.module.scss'

const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

export default function MDIChart({ dataset=[], children=false }) {
  
  const options = {
    tooltip: {
        position: 'top',
        formatter: (params) => {
            const data = params['data'];
            if(data.length<3)
                return ''

            const val = data[2]
            return `${((val*100)/10).toFixed(2)}%`
        }
    },
    grid: {
      height: '10%',
      top: '40%'
    },
    yAxis: {
      type: 'category',
      data: [''],
      splitArea: {
        show: true
      }
    },
    xAxis: {
      type: 'category',
      data: months,
      splitArea: {
        show: true
      }
    },
    visualMap: {
      show:false,
      min: 0,
      max: 10,
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      top: '80px',
      inRange : {   
          color: ['#effaf5','hsl(0deg, 0%, 21%)'] //From smaller to bigger value ->
      }
    },
    series: [
        {
            name: '',
            type: 'heatmap',
            data: dataset ? dataset.map( (v,idx) => [idx,0,Math.min(v,10)] ) : [],
            label: {
                show: false
            },
            emphasis: {
                itemStyle: {
                    shadowBlur: 10,
                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                }
            }
        }
    ]
  };

  return (
      <>
        <div className="columns is-multiline">

          <div className={['column', children ? 'is-6' : 'is-12'].join(' ')}>
            <div className='level-item'>
              <div className="content" style={{width: '100%'}}>   
                <ReactECharts option={options} /> 
              </div>
            </div>
          </div>

          { children &&
            <div className='column is-6'>
                {children}
            </div>
          }

        </div>
      </>
  );
}