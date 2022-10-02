import moment from 'moment'

export const getDataSafe = ({key, data, default_response=''}) => {
  let json = {};
  if(Array.isArray(data) && data.length>0)
    json=data[0];
  else
    json=data;
    
  if(!json[key])
    return default_response;
  
  return json[key];
}

export function getDate(opts={}) {
    const {days=0,months=0,years=0} = opts

    const getBusinessDaysUntilNow = (opts={}) => {
      const now = new Date()
      const {day=now.getnow(),month=now.getMonth(),year=now.getFullYear()} = opts
      const date = new Date(`${day}/${month}/${year}`);

      let count = 0;
      while (now >= date) {
          const dayOfWeek = now.getDay();
          if(dayOfWeek !== 0 && dayOfWeek !== 6) count++;
          now.setDate(now.getDate() - 1);
      }

      return count;
    }

    const getDaysUntilNow = (opts={}) => {
      const now = new Date()
      const {day=now.getnow(),month=now.getMonth(),year=now.getFullYear()} = opts

      const date = new Date(`${day}/${month}/${year}`);
      const difference = date.getTime() - now.getTime();
      
      return Math.ceil(difference / (1000 * 3600 * 24))
    }

    const format = (f='y-m-d') => {
        return f.replace(/y/g,year).replace(/m/g,`${month}`.padStart(2, 0)).replace(/d/g,`${day}`.padStart(2, 0))
    }

    const moment_ = () => {
      return moment(format('d/m/y'),'DD/MM/YYYY')
    }

    // Return today's date and time
    const now = new Date()

    now.setDate(now.getDate() + days);
    now.setMonth(now.getMonth() + months);
    now.setFullYear(now.getFullYear() + years);

    // returns the month (from 0 to 11)
    const month = now.getMonth() + 1;

    // returns the day of the month (from 1 to 31)
    const day = now.getDate();

    // returns the year (four digits)
    const year = now.getFullYear();

    const date = {day,month,year};

    const daysUntilNow = getDaysUntilNow(date);

    const businessDaysUntilNow = getBusinessDaysUntilNow(date);

    return {...date, daysUntilNow, businessDaysUntilNow, format, moment:moment_}
}



export function format(n=0) {
  const moeda = (opts={}) => {
    const {divisor=1, sufix='', prefix='R$'} = opts;

    if(!/[\d.-]/.test(n))
      n=0;

    return `${prefix} ${(parseFloat(n)/divisor).toFixed(2).replace('.',',')} ${sufix}`;
  }

  const numero = (opts={}) => {
    const {divisor=1, sufix='', prefix=''} = opts;

    if(!/[\d-]/.test(n))
      n=0;

    return `${prefix} ${parseInt((n/divisor),10)} ${sufix}`;
  }

  const percent = (opts={}) => {
    const {sufix='%'} = opts;

    if(!/[\d.-]/.test(n))
      n=0;

    return `${parseFloat(n).toFixed(2).replace('.',',')}${sufix}`;
  }

  const date = (opts={}) => {
    const {format='DD/MM/YY'} = opts;

    const date = moment(n);
    if(!date.isValid())
      return '';

    return date.format(format)
  }

  return {
    moeda,
    numero,
    percent,
    date
  }
}

export function arrMax(arr=[]) {
  const max = Math.max(...arr);
  return arr[arr.indexOf(max)];
}

export function arrMin(arr=[]) {
  const max = Math.min(...arr);
  return arr[arr.indexOf(max)];
}