import Router from 'next/router'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMagnifyingGlass, faWarning } from '@fortawesome/free-solid-svg-icons'

import Autocomplete from './Autocomplete';

import utilStyles from '../styles/utils.module.scss';

export default function DataSearch({ list=[], onSelect=false }) {

  const onTickerSelect = ({index}) =>{
    const { ticker, data_type='fii' } = list[index];
    
    Router.push({
      pathname: `/${data_type}`,
      query: { ticker },
    })
  }

  return (
    <div className={"control has-icons-left has-icons-right " + utilStyles.im_search}>
        <Autocomplete 
            class="input is-rounded" 
            placeholder="Busque um Ativo" 
            suggestions={list.map( ({ ticker, nome }) => `${ticker}<br/><small>${nome}</small>` )} 
            onSelect={onSelect ? onSelect : onTickerSelect}
            />
        
        <span className="icon is-small is-left">
            <FontAwesomeIcon icon={faMagnifyingGlass} />
        </span>
    </div>
  )
}