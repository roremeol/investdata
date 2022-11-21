import moment from 'moment';

import { getDate, getDataSafe, format, arrMax, arrMin } from "./utils";

export async function parseData(data=[], snowflake={}) {
    if(data.length==0)
      return {}
      
    const getFiiData = ({key, dt=null, default_response=''}) => {
        if(!dt)
            dt=data;

        if(Array.isArray(dt) && dt.length>0)
            dt=dt[0];
        else
            dt=dt;

        if(/\./.test(key))
        {
            const new_key=key.split('.');
            return getFiiData({data:dt[new_key[0]], key:new_key.slice(1,new_key.length).join('.')})
        }

        if(!dt[key])
            return default_response;
        
        return dt[key]
    }

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
        const {color=''} = indicator.find(({tag}) => tag===tag_) | {}
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
        data:parseData(),
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
        max: format( arrMax(prices.filter(({date}) => moment(date).isAfter( getDate({months:-2}).moment() ) ).map( ({close}) => close )) ).moeda(),
        min: format( arrMin(prices.filter(({date}) => moment(date).isAfter( getDate({months:-2}).moment() ) ).map( ({close}) => close )) ).moeda(),
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