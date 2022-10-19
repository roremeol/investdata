import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import moment from 'moment';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUp, faArrowDown, prefix } from '@fortawesome/free-solid-svg-icons';

import Navbar from '../components/Navbar';
import DataSearch from '../components/DataSearch';
import { getData, getConfig } from "../lib/data_utils";
import { getDate, getDataSafe, format, arrMax, arrMin } from "../lib/utils";
import StockPriceChart from '../components/StockPriceChart';
import MultiDataChart from '../components/MultiDataChart';
import MDIChart from '../components/MDIChart';
import Snowflake from '../components/Snowflake';
import TablePaginated from '../components/TablePaginated';
import IndicatorField from '../components/IndicatorField';
import DividendsChart from '../components/DividendsChart';

import utilStyles from '../styles/utils.module.scss';
import grafStyle from '../styles/graf.module.scss';

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

      const cagr = (vi,vf,t) => (Math.pow((vf/Math.max(vi,1)),(1/Math.max(t,1)))-1)
    

      const dividends = [...getDataSafe({key:'dividends', data, default_response:[]}).sort((d1,d2) => moment(d1.data_com).unix()-moment(d2.data_com).unix())];
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

      const mkMDIGraf = () => {
        const result = [0,0,0,0,0,0,0,0,0,0,0,0]

        dividends.filter(({data_com}) => moment(data_com).isAfter( getDate({years:-2}).moment() ) )
                  .forEach( ({data_com}) => {
                    const month = moment(data_com).format('M')
                    result[month-1]++;
                  });
        
        return result;
      }
      
      const mkPayoutGraf = () => {
        return {
          label:indicadores.map( ({ano}) => (ano) ),
          datasets:[
            {
              type:'line',
              title:'PAYOUT',
              dataset: indicadores.map( ({payout}) => (payout) ),
              formatter:(val) => format( val*100 ).percent(),
            },
            {
              type:'bar',
              title:'LUCRO LÍQUIDO',
              dataset: indicadores.map( ({lucro_liquido}) => (lucro_liquido) ),
              formatter:(val) => format( val/1000000 ).moeda({prefix:'',sufix:'Mi'}),
            },
            {
              type:'bar',
              title:'PROVENTOS',
              dataset: indicadores.map( ({dividend_yield,cotacao}) => (dividend_yield*cotacao) ),
              formatter:(val) => format( val ).moeda(),
            }
          ]
        }
      }
      
      const mkMargenGraf = () => {
        return {
          label:indicadores.map( ({ano}) => (ano) ),
          datasets:[
            {
              type:'line',
              title:'Bruta',
              dataset: indicadores.map( ({marg_brut}) => (marg_brut) ),
              formatter:(val) => format( val*100 ).percent(),
            },
            {
              type:'line',
              title:'Ebitida',
              dataset: indicadores.map( ({marg_ebitda}) => (marg_ebitda) ),
              formatter:(val) => format( val*100 ).percent(),
            },
            {
              type:'line',
              title:'Ebit',
              dataset: indicadores.map( ({marg_ebit}) => (marg_ebit) ),
              formatter:(val) => format( val*100 ).percent(),
            },
            {
              type:'line',
              title:'Liquida',
              dataset: indicadores.map( ({marg_liq}) => (marg_liq) ),
              formatter:(val) => format( val*100 ).percent(),
            }
          ]
        }
      }
      
      const mkLucroCotacaoGraf = () => {
        return {
          label:indicadores.map( ({ano}) => (ano) ),
          datasets:[
            {
              type:'line',
              title:'Lucro',
              dataset: indicadores.map( ({lucro_liquido}) => (lucro_liquido) ),
              formatter:(val) => format( val/1000000 ).moeda({prefix:'',sufix:'Mi'}),
            },
            {
              type:'line',
              title:'Cotação',
              dataset: indicadores.map( ({cotacao}) => (cotacao) ),
              formatter:(val) => format( val ).moeda(),
            }
          ]
        }
      }
      
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
      const price_1 = getDataSafe({key:'close', data:prices.slice(-30), default_response:0});
      const price_12 = getDataSafe({key:'close', data:prices.slice(-52*5), default_response:0});
      
      return {
        ticker: getDataSafe({key:'ticker', data}),
        datasets:{
          cotacoes:mkCotacoesGraf(),
          dividends:mkDividensGraf(),
          payout:mkPayoutGraf(),
          mdi: mkMDIGraf(),
          margem:mkMargenGraf(),
          lucro_cotacao: mkLucroCotacaoGraf(),
        },
        preco: {
          close: format( getDataSafe({key:'close', data:prices.slice(-1), default_response:0}) ).moeda(),
          date: format( getDataSafe({key:'date', data:prices.slice(-1)}) ).date(),
          change: format( getDataSafe({key:'change', data:prices.slice(-1), default_response:0}) ).percent(),
          max: format( arrMax(prices.filter(({date}) => moment(date).isAfter( getDate({days:-52*7}).moment() ) ).map( ({close}) => close )) ).moeda(),
          min: format( arrMin(prices.filter(({date}) => moment(date).isAfter( getDate({days:-52*7}).moment() ) ).map( ({close}) => close )) ).moeda(),
          arrow: 1, // falta ver
        },
        dy: { 
          last: format( getDataSafe({key:'dividend_yield', data:indicadores.slice(-1), default_response:0})*100 ).percent(),
          last_12: format( dividends.filter(({data_com}) => moment(data_com).isAfter( getDate({years:-1}).moment() )).reduce( (sum,{dy}) => sum+dy,0 ) * 100 / price_1 ).percent(),
        },
        rentabilidade: {
          last: format( (last_price-price_1)*100/Math.max(price_1,1) ).percent(),
          last_12: format( (last_price-price_12)*100/Math.max(price_12,1) ).percent(),
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
        dividends,
        indicadores:indicadores.slice(-1)[0],
        gagr_receitas_5:cagr(getDataSafe({key:'receita_liquida', data:indicadores.slice(-5), default_response:0}), getDataSafe({key:'receita_liquida', data:indicadores.slice(-1), default_response:0}), 5),
        gagr_lucros_5:cagr(getDataSafe({key:'lucro_liquido', data:indicadores.slice(-5), default_response:0}), getDataSafe({key:'lucro_liquido', data:indicadores.slice(-1), default_response:0}), 5),
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
                      
                    <div className="level-item" style={{"flexGrow":"inherit"}}>
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
                    <div className="heading nowrap">Rentabilidade (12m)</div>
                    <div className="title nowrap">{getAcaoData({key:'rentabilidade.last_12'})}</div>
                    <div className="level">
                      <div className="level-item" style={{"flexGrow":"inherit"}}>
                        <div className="">
                          <div className="heading nowrap">Mês atual</div>
                          <div className="title nowrap is-5">{getAcaoData({key:'rentabilidade.last'})}</div>
                        </div>
                      </div>
                  </div>
                </div>
              </div>
            
            </div>

            {/* indicadores de valuation */}
            <div className="columns is-multiline">
  
              <div className="column">
                <div className="box is-card">
                  <div className="heading nowrap">P/L</div>
                  <div className="title nowrap">{format(getAcaoData({key:'indicadores.p__l'})).moeda({prefix:''})}</div>
                </div>
              </div>
  
              {/* <div className="column">
                <div className="box is-card">
                  <div className="heading nowrap">PEG RATIO</div>
                  <div className="title nowrap">{format(getAcaoData({key:'indicadores.peg_ratio'})).moeda({prefix:''})}</div>
                </div>
              </div> */}
  
              <div className="column">
                <div className="box is-card">
                  <div className="heading nowrap">P/VP</div>
                  <div className="title nowrap">{format(getAcaoData({key:'indicadores.p__vpa'})).moeda({prefix:''})}</div>
                </div>
              </div>
  
              <div className="column">
                <div className="box is-card">
                  <div className="heading nowrap">EV/EBITIDA</div>
                  <div className="title nowrap">{format(getAcaoData({key:'indicadores.ev__ebitida'})).moeda({prefix:''})}</div>
                </div>
              </div>
  
              <div className="column">
                <div className="box is-card">
                  <div className="heading nowrap">EV/EBIT</div>
                  <div className="title nowrap">{format(getAcaoData({key:'indicadores.ev__ebit'})).moeda({prefix:''})}</div>
                </div>
              </div>

              <div className="column">
                <IndicatorField 
                  title="P/EBITIDA" 
                  value={format(getAcaoData({key:'indicadores.p__ebit'})).moeda({prefix:''})} />
              </div>
  
              <div className="column">
                <div className="box is-card">
                  <div className="heading nowrap">P/EBIT</div>
                  <div className="title nowrap">{format(getAcaoData({key:'indicadores.p__ebit'})).moeda({prefix:''})}</div>
                </div>
              </div>
  
            </div>
            
            <div className="columns is-multiline">
  
              <div className="column">
                <div className="box is-card">
                  <div className="heading nowrap">VPA</div>
                  <div className="title nowrap">{format(getAcaoData({key:'indicadores.vpa'})).moeda({prefix:''})}</div>
                </div>
              </div>
  
              <div className="column">
                <div className="box is-card">
                  <div className="heading nowrap">P/ATIVO</div>
                  <div className="title nowrap">{format(getAcaoData({key:'indicadores.p__ativo'})).moeda({prefix:''})}</div>
                </div>
              </div>

              <div className="column">
                <div className="box is-card">
                  <div className="heading nowrap">LPA</div>
                  <div className="title nowrap">{format(getAcaoData({key:'indicadores.lpa'})).moeda({prefix:''})}</div>
                </div>
              </div>
  
              <div className="column">
                <div className="box is-card">
                  <div className="heading nowrap">P/SR</div>
                  <div className="title nowrap">{format(getAcaoData({key:'indicadores.p__sr'})).moeda({prefix:''})}</div>
                </div>
              </div>
  
              <div className="column">
                <div className="box is-card">
                  <div className="heading nowrap">P/CAP.GIRO</div>
                  <div className="title nowrap">{format(getAcaoData({key:'indicadores.p__capital_de_giro'})).moeda({prefix:''})}</div>
                </div>
              </div>
  
              <div className="column">
                <div className="box is-card">
                  <div className="heading nowrap">P/ATIVO CIRC. LIQ</div>
                  <div className="title nowrap">{format(getAcaoData({key:'indicadores.p__ativo_circ_liq'})).moeda({prefix:''})}</div>
                </div>
              </div>
  
            </div>

            {/* indicadores de endividmento */}
            <div className="columns is-multiline">
  
              <div className="column">
                <IndicatorField 
                  title="DÍV. LÍQUIDA/PL" 
                  value={format(getAcaoData({key:'indicadores.div_liq__pl'})).moeda({prefix:''})} />
              </div>
  
              <div className="column">
                <IndicatorField 
                  title="DÍV. LÍQUIDA/EBITDA" 
                  value={format(getAcaoData({key:'indicadores.divida_liquida__ebitida'})).moeda({prefix:''})} />
              </div>
  
              <div className="column">
                <IndicatorField 
                  title="DÍV. LÍQUIDA/EBIT" 
                  value={format(getAcaoData({key:'indicadores.divida_liquida__ebit'})).moeda({prefix:''})} />
              </div>
  
              <div className="column">
                <IndicatorField 
                  title="PL/ATIVOS" 
                  value={format(getAcaoData({key:'indicadores.pl__ativo'})).moeda({prefix:''})} />
              </div>
  
              <div className="column">
                <IndicatorField 
                  title="PASSIVOS/ATIVOS" 
                  value={format(getAcaoData({key:'indicadores.passivo__ativo'})).moeda({prefix:''})} />
              </div>
  
              <div className="column">
                <IndicatorField 
                  title="LIQ. CORRENTE" 
                  value={format(getAcaoData({key:'indicadores.liquidez_corrente'})).moeda({prefix:''})} />
              </div>
  
            </div>

            <div className="columns is-multiline">


              {/* indicadores de eficiência */}
              <div className="column is-4">
                <div className="columns is-multiline">
                  <div className="column">
                    <IndicatorField 
                      title="M. Bruta" 
                      value={format(getAcaoData({key:'indicadores.marg_brut'})*100).percent()} />
                  </div>

                  <div className="column">
                    <IndicatorField 
                      title="M. EBITIDA" 
                      value={format(getAcaoData({key:'indicadores.marg_ebitda'})*100).percent()} />
                  </div>
                </div>


                <div className="columns is-multiline">
                  <div className="column">
                    <IndicatorField 
                      title="M. EBIT" 
                      value={format(getAcaoData({key:'indicadores.marg_ebit'})*100).percent()} />
                  </div>

                  <div className="column">
                    <IndicatorField 
                      title="M. LÍQUIDA" 
                      value={format(getAcaoData({key:'indicadores.marg_liq'})*100).percent()} />
                  </div>
                </div>
              </div>


              {/* indicadores de rentabilidade */}
              <div className="column is-4">
                <div className="columns is-multiline">
                  <div className="column">
                    <IndicatorField 
                      title="ROE" 
                      value={format(getAcaoData({key:'indicadores.roe'})*100).percent()} />
                  </div>

                  <div className="column">
                    <IndicatorField 
                      title="ROA" 
                      value={format(getAcaoData({key:'indicadores.roa'})*100).percent()} />
                  </div>
                </div>


                <div className="columns is-multiline">
                  <div className="column">
                    <IndicatorField 
                      title="ROIC" 
                      value={format(getAcaoData({key:'indicadores.roic'})).percent()} />
                  </div>

                  <div className="column">
                    <IndicatorField 
                      title="GIRO ATIVOS" 
                      value={format(getAcaoData({key:'indicadores.giro_dos_ativos'})).moeda({prefix:''})} />
                  </div>
                </div>
              </div>


              {/* indicadores de crescimento */}
              <div className="column is-4">
                <div className="columns is-multiline">
                  <div className="column">
                    <IndicatorField 
                      title="CAGR RECEITAS 5 ANOS" 
                      value={format(getAcaoData({key:'gagr_receitas_5'})*100).percent()} />
                  </div>

                  <div className="column">
                    <IndicatorField 
                      title="CAGR LUCORS 5 ANOS" 
                      value={format(getAcaoData({key:'gagr_lucros_5'})*100).percent()} />
                  </div>
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
                    LUCRO X COTAÇÃO
                  </div>
                  <div className="graf">
                    <MultiDataChart dataset={getAcaoData({key:`datasets.lucro_cotacao`})} />
                  </div>
                </div>
              </div>

            </div>
  
            <div className="columns is-multiline">
  
              <div className="column is-12">
                <div className="box is-card">
                  <div className="heading nowrap">
                    PAYOUT
                  </div>
                  <div className="graf">
                    <MultiDataChart dataset={getAcaoData({key:`datasets.payout`})} />
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
                    Mapa do dividendos inteligente
                  </div>
                  <div className="graf">
                    <MDIChart dataset={getAcaoData({key:`datasets.mdi`})} >
                      <TablePaginated 
                        header={['Tipo','Data','Dividendo']} 
                        body={getAcaoData({key:`dividends`,default_response:[]}).map(({tipo='',data_com='',dividendo=''}) => [tipo,moment(data_com).format('DD/MM/YY'),format(dividendo).moeda()])}
                      />                      
                    </MDIChart>
                  </div>
                </div>
              </div>
  
            </div>
  
            <div className="columns is-multiline">

              <div className="column is-12">
                <div className="box is-card">
                  <div className="heading nowrap">
                    Margens
                  </div>
                  <div className="graf">
                    <MultiDataChart dataset={getAcaoData({key:`datasets.margem`})} />
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