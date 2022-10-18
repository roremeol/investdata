import React, { useEffect, useState } from 'react'
import ReactECharts from 'echarts-for-react';

import { colors } from '../lib/utils'
import grafStyle from '../styles/graf.module.scss'

export default function MultiDataChart({ dataset={} }) {
  const { label=[], datasets=[] } = dataset;

  const [data, setData] = useState({
    label:[],
    datasets:[]
  })

  useEffect(() => {
    setData({
      label,
      datasets
    })
  },[dataset])

  const _colors = colors()
  const options = {
    color: _colors,
    legend: {},
    tooltip: {
      axisPointer: {
        type: 'cross'
      },
      formatter: (params) => {
        const { dataIndex=0 } = params;
        
        const html = data.datasets.map( ({title,dataset,formatter=false},index) => {
          const val = dataset[dataIndex];
          const c = index % _colors.length
          const color = _colors[c]
          
          return `
          <span style="display:flex; align-items: center;margin-bottom: 0.2rem">                                    
            <span style="display:block;width:10px; Height:10px;margin-right: 5px; padding:1px;border-radius:10px; background-color:${color}"></span>                                    
            <span style="display:block;margin-top:5px">                                        
              <span style="display:block;font-size:10px;line-height:11px">${title}:</span>                                        
              <span style="display:block;font-weight: 900; font-size:14px; line-height:13px">${formatter ? formatter(val) : val}</span>                                    
            </span>                                
          </span> 
          `
        } ).join('')
 
        // params[0].value=formatter(params[0].value)
        return `
          <span style="display:block;font-weight:600;font-size:14px;line-height:13px">${label[dataIndex]}</span>                                
          ${html}
        `
      },
    },
    xAxis: { 
      type: 'category',
      data: data.label,
    },
    yAxis: data.datasets.map( ({formatter=false},index) => {
      return { 
        type: 'value',
        alignTicks: true,
        show:index==0,
        axisLabel:{
          formatter:(val) => formatter ? formatter(val) : val
        }
      }
    }),

    // Declare several bar series, each will be mapped
    // to a column of dataset.source by default.
    series: data.datasets.map( ({title,type,dataset},index) => {
      return { 
        type,
        name: title,
        data: dataset,
        yAxisIndex: index,
      }
    }),
  }

  return (
      <>
        <div className="columns is-multiline">

          <div className="column is-12">
            <div className='level-item' style={{height: '100%'}}>
              <div className="content" style={{width: '100%'}}>   
                {/* <h4 className="title is-6 has-text-centered">Região x Quantidade de Ativos</h4>   */}
                <ReactECharts className={grafStyle.graf_radar} option={data.datasets.length > 0 ? options : {}} /> 
              </div>
            </div>
          </div>

        </div>
      </>
  );
}