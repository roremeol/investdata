import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import moment from 'moment'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowUp, faArrowDown } from '@fortawesome/free-solid-svg-icons'

import { parseData } from '../../lib/parse_fii'

import Navbar from '../../components/Navbar'
import DataSearch from '../../components/DataSearch'
import { getData, getConfig } from "../../lib/data_utils";
import { format } from "../../lib/utils";
import StockPriceChart from '../../components/StockPriceChart'
import DividendsChart from '../../components/DividendsChart'
import Snowflake from '../../components/Snowflake'
import RealstateChart from '../../components/RealstateChart'

import utilStyles from '../../styles/utils.module.scss';

export async function getStaticProps() {
    const fiis = getData('fii');
    const data = [...fiis,...getData('acao')]
    const config = getConfig('fii');
    return {
      props: {
        search_list:data.map( ({ticker,data_type,nome}) => ({ticker,data_type,nome}) ),
        fiis,
        config
      },
    };
}

// export async function getStaticPaths() {
//   const fiis = getData('fii');
//   const data = [...fiis,...getData('acao')]

//   // Get the paths we want to pre-render based on posts
//   const paths = data.map( ({ticker}) => ({
//     params: { ticker },
//   }))

//   // We'll pre-render only these paths at build time.
//   // { fallback: false } means other routes should 404.
//   return { paths, fallback: false }
// }

export default function FiisPage({ search_list=[], fiis=[], config={} }) {
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

    const fii = fiis.filter( (f) => f.ticker==ticker );
    parseData(fii, snowflake)
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
                <div className="title nowrap">{getFiiData({key:'preco.close'})}{getFiiData({key:'preco.arrow'})>=0 ? <FontAwesomeIcon icon={faArrowUp} /> : <FontAwesomeIcon icon={faArrowDown} />}</div>
                <div className="level">
                    <div className="level-item">
                      <div className="">
                        <div className="heading nowrap">Máx. 52 semanas</div>
                        <div className="title nowrap is-5">{getFiiData({key:'preco.max'})}</div>
                      </div>
                    </div>
                  <div className="level-item">
                    <div className="">
                      <div className="heading nowrap">Mín. 52 semanas</div>
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