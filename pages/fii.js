import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import moment from 'moment'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowUp, faArrowDown } from '@fortawesome/free-solid-svg-icons'

import Navbar from './components/Navbar'
import FiiSearch from './components/FiiSearch'
import { getData, getConfig } from "./lib/fiis";
import { getDate, getDataSafe, format } from "./lib/utils";
import StockPriceChart from './components/StockPriceChart'
import DividendsChart from './components/DividendsChart'
import Snowflake from './components/Snowflake'
import RealstateChart from './components/RealstateChart'

import utilStyles from '../styles/utils.module.scss';

export async function getStaticProps() {
    const fiis = getData('fii');
    const config = getConfig('fii');
    return {
      props: {
        fiis,
        config
      },
    };
}

export default function Home({ fiis=[], config={} }) {
  const { snowflake={} } = config;
  const router = useRouter();
  
  const [state, setState] = useState({
    ticker:'',
    grafs:{
      cotacoes:'1M',
      dividends:'Mensal',
      dy:'Mensal'
    }
  });

  useEffect(() => {
    const { ticker } = router.query;

    setState({
      ...parseData(fiis.filter( (f) => f.ticker==ticker )),
      ticker,
      grafs:{
        ...state.grafs,
        cotacoes:'1M',
        dividends:'Mensal',
        dy:'Mensal'
      }
    })
  }, [router.query.ticker])

  const getFiiData = ({key, data=null, default_response=''}) => {
    if(!data)
      data=state;

    if(Array.isArray(data) && data.length>0)
      data=data[0];
    else
      data=data;

    if(/\./.test(key))
    {
      const new_key=key.split('.');
      return getFiiData({data:data[new_key[0]], key:new_key.slice(1,new_key.length).join('.')})
    }

    if(!data[key])
      return default_response;
    
    return data[key]
  }

  const onTickerSelect = ({index}) =>{
    const { ticker } = fiis[index];
    
    setState({
      ...state,
      ...parseData(fiis.filter( (f) => f.ticker==ticker )),
      ticker
    })
  }

  const onStockTabClick = ({title}) => {
    setState({
      ...state,
      grafs:{
        ...state.grafs,
        cotacoes:title
      }
    })
  }
  const stockTabList = [{title:'1M',onClick:onStockTabClick,active:true},{title:'6M',onClick:onStockTabClick},{title:'1A',onClick:onStockTabClick},{title:'YTD',onClick:onStockTabClick},{title:'Máx',onClick:onStockTabClick}]

  const onDividendsTabClick = ({title}) => {
    setState({
      ...state,
      grafs:{
        ...state.grafs,
        dividends:title
      }
    })
  }
  const dividendsTabList = [{title:'Mensal',onClick:onDividendsTabClick,active:true},{title:'Anual',onClick:onDividendsTabClick}]

  const onDYTabClick = ({title}) => {
    setState({
      ...state,
      grafs:{
        ...state.grafs,
        dy:title
      }
    })
  }
  const dyTabList = [{title:'Mensal',onClick:onDYTabClick,active:true},{title:'Anual',onClick:onDYTabClick}]

  const parseData = (data) => {
    if(data.length==0)
      return {}

    const dividends = getDataSafe({key:'dividends', data, default_response:[]});
    const imr = getDataSafe({key:'imr', data, default_response:[]});
    const prices = getDataSafe({key:'prices', data, default_response:[]});
    const p_vp = prices.slice(0,1).reduce((sum,{close}) => close+sum,0)/imr.slice(-1).reduce((sum,{valor_patrimonio_cotas}) => valor_patrimonio_cotas+sum,1)
    const vacancia = getDataSafe({key:'vacancia', data, default_response:[]});
    const snowflake_ = getDataSafe({key:'snowflake', data, default_response:{}});
    const ativos = getDataSafe({key:'propriedades', data, default_response:[]});
    const days = {
      last_1: getDate({months:-1})['businessDaysUntilNow'],
      last_3: getDate({months:-3})['businessDaysUntilNow'],
      last_6: getDate({months:-6})['businessDaysUntilNow'],
      last_12: getDate({months:-12})['businessDaysUntilNow'],
    }

    const mkCotacoesGraf = () => {
      const dateStr=(dte) => {
        return moment(`${dte.day}/${dte.month}/${dte.year}`,'DD/MM/YYYY')
      }

      const now = getDate();
      const dta = {
        '1M': prices.filter(({date}) => moment(date).isAfter( dateStr( getDate({months:-1}) ) ) ),
        '6M': prices.filter(({date}) => moment(date).isAfter( dateStr( getDate({months:-6}) ) ) ),
        '1A': prices.filter(({date}) => moment(date).isAfter( dateStr( getDate({months:-12}) ) ) ),
        'YTD': prices.filter(({date}) => moment(date).isAfter( dateStr( getDate({days:-(now.day-1), months:-(now.month-1)}) ) ) ),
        'Máx': prices,
      }

      return {
        '1M': {
          headers: dta['1M'].map( ({date}) => format(date).date() ),
          data: dta['1M'].map( ({close}) => close ),
          formatter: (v) => format(v).moeda()
        },
        '6M': {
          headers: dta['6M'].map( ({date}) => format(date).date() ),
          data: dta['6M'].map( ({close}) => close ),
          formatter: (v) => format(v).moeda()
        },
        '1A': {
          headers: dta['1A'].map( ({date}) => format(date).date() ),
          data: dta['1A'].map( ({close}) => close ),
          formatter: (v) => format(v).moeda()
        },
        'YTD': {
          headers: dta['YTD'].map( ({date}) => format(date).date() ),
          data: dta['YTD'].map( ({close}) => close ),
          formatter: (v) => format(v).moeda()
        },
        'Máx': {
          headers: dta['Máx'].map( ({date}) => format(date).date() ),
          data: dta['Máx'].map( ({close}) => close ),
          formatter: (v) => format(v).moeda()
        }
      }
    }

    const mkDividensGraf = () => {
      const yrs = [...new Set(dividends.map( ({data_pagamento}) => moment(data_pagamento).format("YYYY") ))];

      const dta = {
        'Mensal': dividends,
        'Anual': yrs.map( (y) => dividends.filter(({data_pagamento}) => moment(data_pagamento).format("YYYY")===y)
                  .reduce((sum,{provento}) => provento+sum,0) )
      }
      
      return {
        'Anual': {
          headers: yrs,
          data: dta['Anual'],
          formatter: (v) => format(v).moeda()
        },
        'Mensal': {
          headers: dta['Mensal'].map( ({data_pagamento}) => format(data_pagamento).date({format:"MM/YYYY"}) ),
          data: dta['Mensal'].map( ({provento}) => provento ),
          formatter: (v) => format(v).moeda()
        } 
      }
    }

    const mkDYGraf = () => {
      const yrs = [...new Set(imr.map( ({competencia}) => moment(competencia,'MM/YYYY').format("YYYY") ))];
      const dta = {
        'Mensal': imr,
        'Anual': yrs.map( (y) => imr.filter(({competencia}) => moment(competencia,'MM/YYYY').format("YYYY")===y)
                  .reduce((sum,{dy}) => dy+sum,0) )
      }
      
      return {
        'Anual': {
          headers: yrs,
          data: dta['Anual'],
          formatter: (v) => format(v).percent()
        },
        'Mensal': {
          headers: dta['Mensal'].map( ({competencia}) => competencia ),
          data: dta['Mensal'].map( ({dy}) => dy ),
          formatter: (v) => format(v).percent()
        } 
      }
    }

    const parseSnowflake = () => {
      const { data=[], indicator=[] } = snowflake;

      const getColor = (tag_) => {
        const {color=''} = indicator.find(({tag}) => tag===tag_)
        return color
      }
      const getObjective=(objective) => {
        if(typeof objective == 'string')
          return getFiiData({key:objective, data:snowflake_, default_response:0});

        return objective;
      }

      const parseData= () => data.filter(({key}) => key!=false)
                                  .map(({title,key,op,objective,tag}) => {
                                    const value = getFiiData({key, data:snowflake_, default_response:0});
                                    const objective_ = getObjective(objective);

                                    return {
                                      title,
                                      value: /[\d.-]/.test(value) ? value : 0,
                                      op: /[><=!]/.test(op) ? op : '>',
                                      objective: /[\d.-]/.test(objective_) ? objective_ : 0,
                                      color: getColor(tag),
                                      tag
                                    }
                                  })
      
      const dataset = () => {
        const result = (tag_) => {
          const filtered_Data = parseData().filter(({tag}) => tag===tag_);
          return (filtered_Data.reduce((sum,{value,op,objective}) => eval(`(${value}${op}${objective} ? 1 : 0) + ${sum}`),0)/filtered_Data.length)*100
        }
        return indicator.map(({tag}) => result(tag))
      }
    
      const pontuacaoTotal = () => {
        const data = parseData();
        return format( (data.reduce((sum,{value,op,objective}) => eval(`(${value}${op}${objective} ? 1 : 0) + ${sum}`),0)/data.length)*100).percent()
      }

      const last_price =  getDataSafe({key:'close', data:prices.slice(-1), default_response:0});
      const valuation = getFiiData({key:'valuation.valuation', data:snowflake_, default_response:0});

      return {
        indicator:indicator.map((val={}) => {
          const {text='',max=0} = val;
          return {name:text,max}
        }),
        dataset:dataset(),
        pontuacao: pontuacaoTotal(),
        valuation: format( valuation ).moeda(),
        upside: format( (valuation-last_price)*100/Math.max(last_price,1) ).percent(),
      }
    }

    const parseRealstate = () => {
      const estados = [...new Set(ativos.map( ({estado}) => estado ))].sort();
      
      return {
        ativos: estados.map( e => ({value:ativos.filter(({estado}) => estado==e).length, name:e}) ),
        area: estados.map( e => ({value:ativos.filter(({estado}) => estado==e).reduce((sum,{area}) => sum+area,0), name:e}) ),
      } 
    }

    const last_price = getDataSafe({key:'close', data:prices.slice(-1), default_response:0});
    const price_1 = getDataSafe({key:'close', data:prices.slice(-12), default_response:0});
    
    return {
      ticker: getDataSafe({key:'ticker', data}),
      datasets:{
        cotacoes:mkCotacoesGraf(),
        dividends:mkDividensGraf(),
        dy:mkDYGraf(),
        vacancia: {
          headers: vacancia.map(({competencia}) => competencia),
          data: vacancia.map(({total}) => total),
          formatter: (v) => format(v).percent(),
        },
        realstate:parseRealstate(),
      },
      preco: {
        close:format( getDataSafe({key:'close', data:prices.slice(-1), default_response:0}) ).moeda(),
        date:format( getDataSafe({key:'date', data:prices.slice(-1)}) ).date(),
        change: format( getDataSafe({key:'change', data:prices.slice(-1), default_response:0}) ).percent(),
        max: format( getDataSafe({key:'max', data:prices.slice(-1), default_response:0}) ).moeda(),
        min: format( getDataSafe({key:'min', data:prices.slice(-1), default_response:0}) ).moeda(),
        arrow: getDataSafe({key:'change', data:prices.slice(-1), default_response:0}),
      },
      dy: {
        last: format( imr.slice(-1).reduce((sum,{dy}) => dy+sum,0) ).percent(),
        last_3: format( imr.slice(-3).reduce((sum,{dy}) => dy+sum,0) ) .percent(),
        last_6: format( imr.slice(-6).reduce((sum,{dy}) => dy+sum,0) ).percent(),
        last_12: format( imr.slice(-12).reduce((sum,{dy}) => dy+sum,0) ).percent(),
      },
      rentabilidade: format( (last_price-price_1)*100/Math.max(price_1,1) ).percent(),
      provento: {
        last: format( dividends.slice(-1).reduce((sum,{provento}) => provento+sum,0) ).moeda(),
        last_3: format( dividends.slice(-3).reduce((sum,{provento}) => provento+sum,0) ) .moeda(),
        last_6: format( dividends.slice(-6).reduce((sum,{provento}) => provento+sum,0) ).moeda(),
        last_12: format( dividends.slice(-12).reduce((sum,{provento}) => provento+sum,0) ).moeda(),
      },
      vp: {
        last: format( imr.slice(-1).reduce((sum,{valor_patrimonio_cotas}) => valor_patrimonio_cotas+sum,0) ).moeda(),
        last_3: format( imr.slice(-3).reduce((sum,{valor_patrimonio_cotas}) => valor_patrimonio_cotas+sum,0) ) .moeda(),
        last_6: format( imr.slice(-6).reduce((sum,{valor_patrimonio_cotas}) => valor_patrimonio_cotas+sum,0) ).moeda(),
        last_12: format( imr.slice(-12).reduce((sum,{valor_patrimonio_cotas}) => valor_patrimonio_cotas+sum,0) ).moeda(),
      },
      liquidez: {
        last: format( prices.slice(-1).reduce((sum,{volume}) => volume+sum,0) ).numero({divisor:Math.pow(10,3), prefix:'', sufix:'K'}),
        last_3: format( prices.slice(days.last_3*-1).reduce((sum,{volume}) => volume+sum,0) ) .numero({divisor:Math.pow(10,3), prefix:'', sufix:'K'}),
        last_6: format( prices.slice(days.last_6*-1).reduce((sum,{volume}) => volume+sum,0) ).numero({divisor:Math.pow(10,3), prefix:'', sufix:'K'}),
        last_12: format( prices.slice(days.last_12*-1).reduce((sum,{volume}) => volume+sum,0) ).numero({divisor:Math.pow(10,3), prefix:'', sufix:'K'}),
      },
      p_vp: format( p_vp ).percent({sufix:''}),
      pl: format( imr.slice(-1).reduce((sum,{patrimonio_liquido}) => patrimonio_liquido+sum,0) ).moeda({divisor:Math.pow(10,9), sufix:'Bi'}),
      snowflake:parseSnowflake(),
    }
  }

  return (
    <>
      <Navbar title={<span className="title is-4"><span style={{color:'green'}}>{state.ticker}</span></span>}>
        <div className={["navbar-item",utilStyles.im_search_right].join(' ')}>
          <FiiSearch fiis={fiis} onSelect={onTickerSelect} />
        </div>
      </Navbar>

      <div className={utilStyles.im_data}>

        <main className="main">

          <div className="columns is-multiline">

            <div className="column">
              <div className="box is-card">
              <div className="heading nowrap">Preço</div>
                <div className="title nowrap">{getFiiData({key:'preco.close'})}{getFiiData({key:'preco.arrow'})>=0 ? <FontAwesomeIcon icon={faArrowUp} /> : <FontAwesomeIcon icon={faArrowDown} />}</div>
                <div className="level">
                    <div className="level-item">
                      <div className="">
                        <div className="heading nowrap">Máximo</div>
                        <div className="title nowrap is-5">{getFiiData({key:'preco.max'})}</div>
                      </div>
                    </div>
                  <div className="level-item">
                    <div className="">
                      <div className="heading nowrap">Mínimo</div>
                      <div className="title nowrap is-5">{getFiiData({key:'preco.min'})}</div>
                    </div>
                  </div>
                  <div className="level-item">
                    <div className="">
                      <div className="heading nowrap">Variação</div>
                      <div className="title nowrap is-5">{getFiiData({key:'preco.change'})}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="column">
                <div className="box is-card">
                  <div className="heading nowrap">Dividend Yield</div>
                  <div className="title nowrap">{getFiiData({key:'dy.last'})}</div>
                  <div className="level">
                    <div className="level-item">
                      <div className="">
                        <div className="heading nowrap">3 meses</div>
                        <div className="title nowrap is-5">{getFiiData({key:'dy.last_3'})}</div>
                      </div>
                    </div>
                  <div className="level-item">
                    <div className="">
                      <div className="heading nowrap">6 meses</div>
                      <div className="title nowrap is-5">{getFiiData({key:'dy.last_6'})}</div>
                    </div>
                  </div>
                  <div className="level-item">
                    <div className="">
                      <div className="heading nowrap">12 meses	</div>
                      <div className="title nowrap is-5">{getFiiData({key:'dy.last_12'})}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="column">
                <div className="box is-card">
                  <div className="heading nowrap">Último Rendimento</div>
                  <div className="title nowrap">{getFiiData({key:'provento.last'})}</div>
                  <div className="level">
                    <div className="level-item">
                      <div className="">
                        <div className="heading nowrap">3 meses</div>
                        <div className="title nowrap is-5">{getFiiData({key:'provento.last_3'})}</div>
                      </div>
                    </div>
                  <div className="level-item">
                    <div className="">
                      <div className="heading nowrap">6 meses</div>
                      <div className="title nowrap is-5">{getFiiData({key:'provento.last_6'})}</div>
                    </div>
                  </div>
                  <div className="level-item">
                    <div className="">
                      <div className="heading nowrap">12 meses	</div>
                      <div className="title nowrap is-5">{getFiiData({key:'provento.last_12'})}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          
          </div>
          <div className="columns is-multiline">

            <div className="column">
              <div className="box is-card">
                <div className="heading nowrap">Liquidez Diária</div>
                <div className="title nowrap">{getFiiData({key:'liquidez.last'})}</div>
              </div>
            </div>

            <div className="column">
              <div className="box is-card">
                <div className="heading nowrap">P/VP</div>
                <div className="title nowrap">{getFiiData({key:'p_vp'})}</div>
              </div>
            </div>

            <div className="column">
              <div className="box is-card">
                <div className="heading nowrap">Patrimônio Líquido</div>
                <div className="title nowrap">{getFiiData({key:'pl'})}</div>
              </div>
            </div>

            <div className="column">
              <div className="box is-card">
                <div className="heading nowrap">Valor Patrimonial</div>
                <div className="title nowrap">{getFiiData({key:'vp.last_3'})}</div>
              </div>
            </div>

            <div className="column">
              <div className="box is-card">
                <div className="heading nowrap">Rentabilidade</div>
                <div className="title nowrap">{getFiiData({key:'rentabilidade'})}</div>                  
              </div>
            </div>

          </div>

          <div className="columns is-multiline">

            <div className="column is-12">
              <div className="box is-card">
                <div className="heading nowrap">
                  Cotações
                </div>
                <div className="graf">
                  <StockPriceChart tabs={stockTabList} dataset={getFiiData({key:`datasets.cotacoes.${state.grafs.cotacoes}`})}/>
                </div>
              </div>
            </div>

          </div>

          <div className="columns is-multiline">

            <div className="column is-12">
              <div className="box is-card">
                <div className="heading nowrap">
                  Dividendos
                </div>
                <div className="graf">
                  <DividendsChart tabs={dividendsTabList} dataset={getFiiData({key:`datasets.dividends.${state.grafs.dividends}`})}/>
                </div>
              </div>
            </div>

          </div>

          <div className="columns is-multiline">

            <div className="column is-12">
              <div className="box is-card">
                <div className="heading nowrap">
                  Dividend Yield
                </div>
                <div className="graf">
                  <DividendsChart tabs={dyTabList} dataset={getFiiData({key:`datasets.dy.${state.grafs.dy}`})}/>
                </div>
              </div>
            </div>

          </div>

          {getFiiData({key:`datasets.vacancia.headers`}).length > 0 &&
          <div className="columns is-multiline">

            <div className="column is-12">
              <div className="box is-card">
                <div className="heading nowrap">
                  Vacância
                </div>
                <div className="graf">
                  <DividendsChart dataset={getFiiData({key:`datasets.vacancia`})}/>
                </div>
              </div>
            </div>

          </div>
          }
          
          {getFiiData({key:`datasets.realstate.ativos`}).length > 0 &&
          <div className="columns is-multiline">

            <div className="column is-12">
              <div className="box is-card">
                <div className="heading nowrap">
                  Imóveis
                </div>
                <div className="graf">
                  <RealstateChart config={getFiiData({key:`datasets.realstate`})} />
                </div>
              </div>
            </div>

          </div>
          }

          <div className="columns is-multiline">

            <div className="column is-12">
              <div className="box is-card">
                <div className="heading nowrap">
                  Análise
                </div>
                <div className="graf">
                  <Snowflake config={getFiiData({key:`snowflake`})} />
                </div>
              </div>
            </div>

          </div>
        
        </main>
      </div>  
    </>
  );
}