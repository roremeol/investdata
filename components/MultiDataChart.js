import React, { useEffect, useState } from 'react'
import ReactECharts from 'echarts-for-react';

import { format } from '../lib/utils'
import grafStyle from '../styles/graf.module.scss'
import { getData } from '../lib/data_utils';

export default function RealstateChart({ dataset={} }) {
  const { conf=[], datasets=[] } = dataset;

  const [data, setData] = useState({
    conf:[],
    datasets:[]
  })
  
  useEffect(() => {
    setData({
      conf,
      datasets
    })
  },[dataset])

  const parceSouce = () =>{
    const keys = data.conf.map( ({title}) => title )

    return data.datasets.map( ({label,dataset}) => {
      const ret = {label}
      dataset.forEach( (v,i) => {
        ret[keys[i]] = v
      })

      return ret
    })
  }
  
  const options = {
    color: ['#808080','#9b9b9b',"#3a3a3a"],
    legend: {},
    tooltip: {},
    dataset: {
      dimensions: ['label', ...data.conf.map( ({title}) => title )],
      source:parceSouce()
    },
    xAxis: { type: 'category' },
    yAxis: { scale: true },
    // Declare several bar series, each will be mapped
    // to a column of dataset.source by default.
    series: data.conf.map( ({type}) => ({type}) )
  };

  return (
      <>
        <div className="columns is-multiline">

          <div className="column is-12">
            <div className='level-item' style={{height: '100%'}}>
              <div className="content" style={{width: '100%'}}>   
                {/* <h4 className="title is-6 has-text-centered">Região x Quantidade de Ativos</h4>   */}
                <ReactECharts className={grafStyle.graf_radar} option={options} /> 
              </div>
            </div>
          </div>

        </div>
      </>
  );
}