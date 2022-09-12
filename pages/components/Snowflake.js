import React, { useState, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';

import { format } from '../lib/utils';
import grafStyle from '../../styles/graf.module.scss'

export default function Snowflake({ config={} }) {
  const { data=[], indicator=[{ text: 'Dividendos', max: 100 }] } = config;
  
  const dataset = () => {
    const result = (tag_) => {
      const filtered_Data = data.filter(({tag}) => tag===tag_);
      return (filtered_Data.reduce((sum,{value,op,objective}) => eval(`(${value}${op}${objective} ? 1 : 0) + ${sum}`),0)/filtered_Data.length)*100
    }
    return indicator.map(({tag}) => result(tag))
  }

  const pontuacaoTotal = () => {
    return format( (data.reduce((sum,{value,op,objective}) => eval(`(${value}${op}${objective} ? 1 : 0) + ${sum}`),0)/data.length)*100).percent()
  }

  const options = {
    color: ['hsl(0deg, 0%, 21%)'],
    legend: {},
    radar: [
      {
        indicator:indicator.map((val={}) => {
          const {text='',max=0} = val;
          return {name:text,max}
        }),
        center: ['50%', '55%'],
        radius: 120,
        axisName: {
          color: 'hsl(0deg, 0%, 21%)',
          backgroundColor: 'rgb(200,200,200)',
          borderRadius: 3,
          padding: [3, 5]
        },
        splitArea: {
          areaStyle: {
            color: ['rgba(0,0,0,0)','rgb(200,200,200)'],
            shadowColor: 'rgba(0, 0, 0, 0.2)',
            shadowBlur: 10
          }
        },
      }
    ],
    series: [
      {
        type: 'radar',
        data: [
          {
            value: dataset(),
            areaStyle: {
              color: 'hsl(0deg, 0%, 21%)',
              offset: 1
            }
          }
        ]
      }
    ]
  };

  return (
      <>
        <div className="columns is-multiline">

          <div className="column is-6">
            <div className='level-item' style={{height: "100%;"}}>
              <div className="content">   
                <h4 className="title is-6 has-text-centered">Pontuação Total:</h4>  
                <p className="title is-1 has-text-centered">{pontuacaoTotal()}</p>           
              </div>
            </div>
          </div>

          <div className="column is-6">
            <div className='level-item' style={{height: "100%;"}}>
              <ReactECharts className={grafStyle.graf_radar} option={options} />
            </div>
          </div>

        </div>

        {/* <div className="columns is-multiline">

          <div className="column is-12">
            <div className='level-item' style={{height: "100%;"}}>
              
              <table className={['table',grafStyle.table].join(' ')}>
                  <thead>
                    <tr>
                      <th>
                        Indicator
                      </th>
                      <th>
                        Valor 
                      </th>
                      <th>
                        Operador
                      </th>
                      <th>
                        Meta
                      </th>
                      <th>
                        Resultado
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map(({title='',value='',op='',objective=0,color=''}) => {
                      return (
                        <tr>
                          <td style={{color}}>{title}</td>
                          <td style={{color}}>{value}</td>
                          <td style={{color}}>{op}</td>
                          <td style={{color}}>{objective}</td>
                          <td style={{color}}>{eval(`${value}${op}${objective} ? 1 : 0`)}</td>
                        </tr>
                      )
                    })}
                  </tbody>
              </table>

            </div>
          </div>

        </div> */}
      </>
  );
}