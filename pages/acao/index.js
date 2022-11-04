import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import moment from 'moment';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUp, faArrowDown } from '@fortawesome/free-solid-svg-icons';

import { parseData } from './parse'

import Navbar from '../../components/Navbar';
import DataSearch from '../../components/DataSearch';
import { getData, getConfig } from "../../lib/data_utils";
import { format } from "../../lib/utils";
import StockPriceChart from '../../components/StockPriceChart';
import MultiDataChart from '../../components/MultiDataChart';
import MDIChart from '../../components/MDIChart';
import Snowflake from '../../components/Snowflake';
import TablePaginated from '../../components/TablePaginated';
import IndicatorField from '../../components/IndicatorField';
import DividendsChart from '../../components/DividendsChart';

import utilStyles from '../../styles/utils.module.scss';
import grafStyle from '../../styles/graf.module.scss';

export async function getStaticProps() {
    const acoes = getData('acao');
    const data = [...getData('fii'), ...acoes]
    const config = getConfig('acao');

    return {
      props: {
        search_list:data.map( ({ticker,data_type,nome}) => ({ticker,data_type,nome}) ),
        acoes,
        config,
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
      
      const acao = acoes.filter( (f) => f.ticker==ticker );
      parseData(acao, snowflake)
      .then( (result) => {
        setState({
            ...result,
            ticker,
            grafs:{
              ...state.grafs,
              cotacoes:'1M',
              dividends:'Mensal',
              dy:'Mensal'
            }
        })
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