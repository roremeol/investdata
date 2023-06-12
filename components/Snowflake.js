import React from 'react';
import ReactECharts from 'echarts-for-react';

import grafStyle from '../styles/graf.module.scss'

export default function Snowflake({ config={} }) {
  const { dataset=[], indicator=[{ text: 'Dividendos', max: 100 }], pontuacao='0.00%', valuation='R$ 0,00', upside='0.00%', data=[] } = config;
  
  const options = {
    color: ['hsl(0deg, 0%, 21%)'],
    legend: {},
    radar: [
      {
        indicator,
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
            value: dataset,
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
            <div className='level-item' style={{height: '100%'}}>
              <div className="content">   
                <h4 className="title is-6 has-text-centered">Pontuação Total:</h4>  
                <p className="title is-1 has-text-centered">{pontuacao}</p> 
                <p></p>
                <h4 className="title is-6 has-text-centered">Preço Teto:</h4>  
                <p className="title is-1 has-text-centered">{valuation}</p>     
                <p></p>
                <h4 className="title is-6 has-text-centered">Potencial de valorização:</h4>  
                <p className="title is-1 has-text-centered">{upside}</p>          
              </div>
            </div>
          </div>

          <div className="column is-6">
            <div className='level-item' style={{height: '100%'}}>
              <ReactECharts className={grafStyle.graf_radar} option={options} />
            </div>
          </div>

        </div>

        <div className="columns is-multiline">

          <div className="column is-12">
            <div className='level-item' style={{height: '100%'}}>
              
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
                    {data.map(({title='',value='',op='',objective=0,color=''},idx) => {
                      return (
                        <tr key={idx} >
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

        </div> 
      </>
  );
}