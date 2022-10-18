import React from 'react';
import ReactECharts from 'echarts-for-react';

import { format,colors } from '../lib/utils'
import grafStyle from '../styles/graf.module.scss'

export default function RealstateChart({ config={} }) {
  const { ativos=[], area=[] } = config;

  const ativosTotais = ativos.reduce((sum,{value}) => sum+value,0);
  const areaTotal = area.reduce((sum,{value}) => sum+value,0);
  
  const options1 = {
    color: colors(),
    tooltip: {
      trigger: 'item',
      formatter: ({seriesName,marker,name,value}) => `<div style="margin: 0px 0 0;line-height:1;">
                                                          <div style="font-size:14px;color:#666;font-weight:400;line-height:1;">${seriesName}</div>
                                                          <div style="margin: 10px 0 0;line-height:1;">
                                                              <div style="margin: 0px 0 0;line-height:1;">
                                                                  ${marker}
                                                                  <span style="font-size:14px;color:#666;font-weight:400;margin-left:2px">${name}</span>
                                                                  <span style="float:right;margin-left:20px;font-size:14px;color:#666;font-weight:900">${value} (${format(value*100/ativosTotais).percent()})</span>
                                                              </div>
                                                          </div>
                                                      </div>`
    },
    legend: {
      top: '5%',
      left: 'center'
    },
    series: [
      {
        name: `Quantidade de Ativos (total:${ativosTotais})`,
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '40',
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: ativos
      }
    ]
  };

  const options2 = {
    ...options1,
    tooltip: {
        trigger: 'item',
        formatter: ({seriesName,marker,name,value}) => `<div style="margin: 0px 0 0;line-height:1;">
                                                            <div style="font-size:14px;color:#666;font-weight:400;line-height:1;">${seriesName}</div>
                                                            <div style="margin: 10px 0 0;line-height:1;">
                                                                <div style="margin: 0px 0 0;line-height:1;">
                                                                    ${marker}
                                                                    <span style="font-size:14px;color:#666;font-weight:400;margin-left:2px">${name}</span>
                                                                    <span style="float:right;margin-left:20px;font-size:14px;color:#666;font-weight:900">${format(value).numero({divisor:Math.pow(10,3), sufix:'K'})} (${format(value*100/areaTotal).percent()})</span>
                                                                </div>
                                                            </div>
                                                        </div>`
    },
    series: [
      {
        ...options1.series[0],
        name: `Área dos Ativos (total:${format(areaTotal).numero({divisor:Math.pow(10,3), sufix:'K'})})`,
        data: area
      }
    ]
  };

  return (
      <>
        <div className="columns is-multiline">

          <div className="column is-6">
            <div className='level-item' style={{height: '100%'}}>
              <div className="content" style={{width: '100%'}}>   
                <h4 className="title is-6 has-text-centered">Região x Quantidade de Ativos</h4>  
                <ReactECharts className={grafStyle.graf_radar} option={options1} /> 
              </div>
            </div>
          </div>

          <div className="column is-6">
            <div className='level-item' style={{height: '100%'}}>
              <div className="content" style={{width: '100%'}}>   
                <h4 className="title is-6 has-text-centered">Região x Área dos Ativos</h4>  
                <ReactECharts className={grafStyle.graf_radar} option={options2} />
              </div>
            </div>
          </div>

        </div>
      </>
  );
}