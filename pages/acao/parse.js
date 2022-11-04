import moment from 'moment';

import { getDate, getDataSafe, format, arrMax, arrMin } from "../../lib/utils";

export async function parseData(data=[], snowflake={}) {
    if(data.length==0)
      return {}

    const cagr = (vi,vf,t) => (Math.pow((vf/Math.max(vi,1)),(1/Math.max(t,1)))-1)
    
    const getAcaoData = ({key, dt=null, default_response=''}) => {
        if(!dt)
          dt=data;
    
        if(Array.isArray(dt) && dt.length>0)
          dt=dt[0];
        else
          dt=dt;
    
        if(/\./.test(key))
        {
          const new_key=key.split('.');
          return getAcaoData({data:dt[new_key[0]], key:new_key.slice(1,new_key.length).join('.')})
        }
    
        if(!dt[key])
          return default_response;
        
        return dt[key]
    }

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