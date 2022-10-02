import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import moment from 'moment'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowUp, faArrowDown } from '@fortawesome/free-solid-svg-icons'

import Navbar from '../components/Navbar'
import DataSearch from '../components/DataSearch'
import { getData, getConfig } from "../lib/data_utils";
import { getDate, getDataSafe, format, arrMax, arrMin } from "../lib/utils";
import StockPriceChart from '../components/StockPriceChart'
import DividendsChart from '../components/DividendsChart'
import Snowflake from '../components/Snowflake'

import utilStyles from '../styles/utils.module.scss';

export async function getStaticProps() {
    const acoes = getData('acao');
    const data = [...getData('fii'), ...acoes]
    const config = getConfig('acao');

    return {
      props: {
        search_list:data.map( ({ticker,data_type,nome}) => ({ticker,data_type,nome}) ),
        acoes,
        config
      },
    };
}

export default function AcaoPage({ search_list=[], acoes=[], config={} }) {
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
        ...parseData(acoes.filter( (f) => f.ticker==ticker )),
        ticker,
        grafs:{
          ...state.grafs,
          cotacoes:'1M',
          dividends:'Mensal',
          dy:'Mensal'
        }
      })
    }, [router.query.ticker])
  
    const getAcaoData = ({key, data=null, default_response=''}) => {
      if(!data)
        data=state;
  
      if(Array.isArray(data) && data.length>0)
        data=data[0];
      else
        data=data;
  
      if(/\./.test(key))
      {
        const new_key=key.split('.');
        return getAcaoData({data:data[new_key[0]], key:new_key.slice(1,new_key.length).join('.')})
      }
  
      if(!data[key])
        return default_response;
      
      return data[key]
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
      const indicadores = getDataSafe({key:'indicadores', data, default_response:[]});
      const prices = getDataSafe({key:'prices', data, default_response:[]});
      const snowflake_ = getDataSafe({key:'snowflake', data, default_response:{}});
      const days = {
        last_1: getDate({months:-1})['businessDaysUntilNow'],
        last_3: getDate({months:-3})['businessDaysUntilNow'],
        last_6: getDate({months:-6})['businessDaysUntilNow'],
        last_12: getDate({months:-12})['businessDaysUntilNow'],
      }
      
      const mkCotacoesGraf = () => {  
        const now = getDate();
        const dta = {
          '1M': prices.filter(({date}) => moment(date).isAfter( getDate({months:-1}).moment() ) ),
          '6M': prices.filter(({date}) => moment(date).isAfter( getDate({months:-6}).moment() ) ),
          '1A': prices.filter(({date}) => moment(date).isAfter( getDate({months:-12}).moment() ) ),
          'YTD': prices.filter(({date}) => moment(date).isAfter( getDate({days:-(now.day-1), months:-(now.month-1)}).moment() ) ),
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
        const yrs = [...new Set(dividends.map( ({data_com}) => moment(data_com).format("YYYY") ))];
  
        const dta = {
          'Mensal': dividends,
          'Anual': yrs.map( (y) => dividends.filter(({data_com}) => moment(data_com).format("YYYY")===y)
                    .reduce((sum,{dividendo}) => dividendo+sum,0) )
        }
        
        return {
          'Anual': {
            headers: yrs,
            data: dta['Anual'],
            formatter: (v) => format(v).moeda()
          },
          'Mensal': {
            headers: dta['Mensal'].map( ({data_com}) => format(data_com).date({format:"MM/YYYY"}) ),
            data: dta['Mensal'].map( ({dividendo}) => dividendo ),
            formatter: (v) => format(v).moeda()
          } 
        }
      }
  
    //   const mkDYGraf = () => {
    //     const yrs = [...new Set(imr.map( ({competencia}) => moment(competencia,'MM/YYYY').format("YYYY") ))];
    //     const dta = {
    //       'Mensal': imr,
    //       'Anual': yrs.map( (y) => imr.filter(({competencia}) => moment(competencia,'MM/YYYY').format("YYYY")===y)
    //                 .reduce((sum,{dy}) => dy+sum,0) )
    //     }
        
    //     return {
    //       'Anual': {
    //         headers: yrs,
    //         data: dta['Anual'],
    //         formatter: (v) => format(v).percent()
    //       },
    //       'Mensal': {
    //         headers: dta['Mensal'].map( ({competencia}) => competencia ),
    //         data: dta['Mensal'].map( ({dy}) => dy ),
    //         formatter: (v) => format(v).percent()
    //       } 
    //     }
    //   }
  
      const parseSnowflake = () => {
        const { data=[], indicator=[] } = snowflake;
        
        const getColor = (tag_) => {
          const {color='hsl(0deg, 0%, 21%)'} = indicator.find(({tag}) => tag===tag_) | {}
          return color
        }
        const getObjective=(objective) => {
          if(typeof objective == 'string')
            return getAcaoData({key:objective, data:snowflake_, default_response:0});
  
          return objective;
        }
  
        const parseData= () => data.filter(({key}) => key!=false)
                                    .map(({title,key,op,objective,tag}) => {
                                      const value = getAcaoData({key, data:snowflake_, default_response:0});
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
        const valuation = getAcaoData({key:'valuation.valuation', data:snowflake_, default_response:0});
  
        return {
          indicator:indicator.map((val={}) => {
            const {text='',max=0} = val;
            return {name:text,max}
          }),
          dataset:dataset(),
          data:parseData(),
          pontuacao: pontuacaoTotal(),
          valuation: format( valuation ).moeda(),
          upside: format( (valuation-last_price)*100/Math.max(last_price,1) ).percent(),
        }
      }
  
      const last_price = getDataSafe({key:'close', data:prices.slice(-1), default_response:0});
      const price_1 = getDataSafe({key:'close', data:prices.slice(-12), default_response:0});
      
      return {
        ticker: getDataSafe({key:'ticker', data}),
        datasets:{
          cotacoes:mkCotacoesGraf(),
          dividends:mkDividensGraf(),
        //   dy:mkDYGraf(),
        },
        preco: {
          close: format( getDataSafe({key:'close', data:prices.slice(-1), default_response:0}) ).moeda(),
          date: format( getDataSafe({key:'date', data:prices.slice(-1)}) ).date(),
          change: format( getDataSafe({key:'change', data:prices.slice(-1), default_response:0}) ).percent(),
          max: format( arrMax(prices.filter(({date}) => moment(date).isAfter( getDate({months:-2}).moment() ) ).map( ({close}) => close )) ).moeda(),
          min: format( arrMin(prices.filter(({date}) => moment(date).isAfter( getDate({months:-2}).moment() ) ).map( ({close}) => close )) ).moeda(),
          arrow: 1, // falta ver
        },
        // dy: {
        //   last: format( imr.slice(-1).reduce((sum,{dy}) => dy+sum,0) ).percent(),
        //   last_3: format( imr.slice(-3).reduce((sum,{dy}) => dy+sum,0) ) .percent(),
        //   last_6: format( imr.slice(-6).reduce((sum,{dy}) => dy+sum,0) ).percent(),
        //   last_12: format( imr.slice(-12).reduce((sum,{dy}) => dy+sum,0) ).percent(),
        // },
        rentabilidade: format( (last_price-price_1)*100/Math.max(price_1,1) ).percent(),
        provento: {
          last: format( dividends.slice(-1).reduce((sum,{dividendo}) => dividendo+sum,0) ).moeda(),
          last_3: format( dividends.slice(-3).reduce((sum,{dividendo}) => dividendo+sum,0) ) .moeda(),
          last_6: format( dividends.slice(-6).reduce((sum,{dividendo}) => dividendo+sum,0) ).moeda(),
          last_12: format( dividends.slice(-12).reduce((sum,{dividendo}) => dividendo+sum,0) ).moeda(),
        },
        liquidez: {
          last: format( prices.slice(-1).reduce((sum,{volume}) => volume+sum,0) ).numero({divisor:Math.pow(10,3), prefix:'', sufix:'K'}),
          last_3: format( prices.slice(days.last_3*-1).reduce((sum,{volume}) => volume+sum,0) ).numero({divisor:Math.pow(10,3), prefix:'', sufix:'K'}),
          last_6: format( prices.slice(days.last_6*-1).reduce((sum,{volume}) => volume+sum,0) ).numero({divisor:Math.pow(10,3), prefix:'', sufix:'K'}),
          last_12: format( prices.slice(days.last_12*-1).reduce((sum,{volume}) => volume+sum,0) ).numero({divisor:Math.pow(10,3), prefix:'', sufix:'K'}),
        },
        // p_vp: format( p_vp ).percent({sufix:''}),
        // pl: format( imr.slice(-1).reduce((sum,{patrimonio_liquido}) => patrimonio_liquido+sum,0) ).moeda({divisor:Math.pow(10,9), sufix:'Bi'}),
        snowflake:parseSnowflake(),
      }
    }
  
    return (
      <>
        <Navbar title={<span className="title is-4"><span style={{color:'green'}}>{state.ticker}</span></span>}>
          <div className={["navbar-item",utilStyles.im_search_right].join(' ')}>
            <DataSearch list={search_list} />
            {/* <DataSearch fiis={fiis} /> */}
          </div>
        </Navbar>
  
        <div className={utilStyles.im_data}>
  
          <main className="main">
  
            <div className="columns is-multiline">
  
              <div className="column">
                <div className="box is-card">
                <div className="heading nowrap">Preço</div>
                  <div className="title nowrap">{getAcaoData({key:'preco.close'})}{getAcaoData({key:'preco.arrow'})>=0 ? <FontAwesomeIcon icon={faArrowUp} /> : <FontAwesomeIcon icon={faArrowDown} />}</div>
                  <div className="level">
                      <div className="level-item">
                        <div className="">
                          <div className="heading nowrap">Máx. 52 semanas</div>
                          <div className="title nowrap is-5">{getAcaoData({key:'preco.max'})}</div>
                        </div>
                      </div>
                    <div className="level-item">
                      <div className="">
                        <div className="heading nowrap">Mín. 52 semanas</div>
                        <div className="title nowrap is-5">{getAcaoData({key:'preco.min'})}</div>
                      </div>
                    </div>
                    <div className="level-item">
                      <div className="">
                        <div className="heading nowrap">Variação</div>
                        <div className="title nowrap is-5">{getAcaoData({key:'preco.change'})}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
  
              <div className="column">
                  <div className="box is-card">
                    <div className="heading nowrap">Dividend Yield</div>
                    <div className="title nowrap">{getAcaoData({key:'dy.last'})}</div>
                    <div className="level">
                      <div className="level-item">
                        <div className="">
                          <div className="heading nowrap">3 meses</div>
                          <div className="title nowrap is-5">{getAcaoData({key:'dy.last_3'})}</div>
                        </div>
                      </div>
                    <div className="level-item">
                      <div className="">
                        <div className="heading nowrap">6 meses</div>
                        <div className="title nowrap is-5">{getAcaoData({key:'dy.last_6'})}</div>
                      </div>
                    </div>
                    <div className="level-item">
                      <div className="">
                        <div className="heading nowrap">12 meses	</div>
                        <div className="title nowrap is-5">{getAcaoData({key:'dy.last_12'})}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
  
              <div className="column">
                  <div className="box is-card">
                    <div className="heading nowrap">Último Rendimento</div>
                    <div className="title nowrap">{getAcaoData({key:'provento.last'})}</div>
                    <div className="level">
                      <div className="level-item">
                        <div className="">
                          <div className="heading nowrap">3 meses</div>
                          <div className="title nowrap is-5">{getAcaoData({key:'provento.last_3'})}</div>
                        </div>
                      </div>
                    <div className="level-item">
                      <div className="">
                        <div className="heading nowrap">6 meses</div>
                        <div className="title nowrap is-5">{getAcaoData({key:'provento.last_6'})}</div>
                      </div>
                    </div>
                    <div className="level-item">
                      <div className="">
                        <div className="heading nowrap">12 meses	</div>
                        <div className="title nowrap is-5">{getAcaoData({key:'provento.last_12'})}</div>
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
                  <div className="title nowrap">{getAcaoData({key:'liquidez.last'})}</div>
                </div>
              </div>
  
              <div className="column">
                <div className="box is-card">
                  <div className="heading nowrap">P/VP</div>
                  <div className="title nowrap">{getAcaoData({key:'p_vp'})}</div>
                </div>
              </div>
  
              <div className="column">
                <div className="box is-card">
                  <div className="heading nowrap">Patrimônio Líquido</div>
                  <div className="title nowrap">{getAcaoData({key:'pl'})}</div>
                </div>
              </div>
  
              <div className="column">
                <div className="box is-card">
                  <div className="heading nowrap">Valor Patrimonial</div>
                  <div className="title nowrap">{getAcaoData({key:'vp.last_3'})}</div>
                </div>
              </div>
  
              <div className="column">
                <div className="box is-card">
                  <div className="heading nowrap">Rentabilidade</div>
                  <div className="title nowrap">{getAcaoData({key:'rentabilidade'})}</div>                  
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
                    <StockPriceChart tabs={stockTabList} dataset={getAcaoData({key:`datasets.cotacoes.${state.grafs.cotacoes}`})}/>
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
                    <DividendsChart tabs={dividendsTabList} dataset={getAcaoData({key:`datasets.dividends.${state.grafs.dividends}`})}/>
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
                    <DividendsChart tabs={dyTabList} dataset={getAcaoData({key:`datasets.dy.${state.grafs.dy}`})}/>
                  </div>
                </div>
              </div>
  
            </div>
  
            <div className="columns is-multiline">
  
              <div className="column is-12">
                <div className="box is-card">
                  <div className="heading nowrap">
                    Análise
                  </div>
                  <div className="graf">
                    <Snowflake config={getAcaoData({key:`snowflake`})} />
                  </div>
                </div>
              </div>
  
            </div>
          
          </main>
        </div>  
      </>
    );
  }