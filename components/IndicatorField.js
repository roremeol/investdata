import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowTrendUp } from '@fortawesome/free-solid-svg-icons'

import { format } from '../lib/utils'
import style from '../styles/indicator.module.scss'

export default function IndicatorField({ title='', value='', children=false}) {

    return (
        <div className="box is-card">
            <div className="heading nowrap">
                {title}
                {/* <div className={["buttons","is-right","are-small",style.butttons].join(' ')}>
                    <span className={["has-tooltip-arrow","has-tooltip-text-right",style.button].join(' ')} data-tooltip="Info tooltip content"><FontAwesomeIcon icon={faArrowTrendUp} /></span>
                </div> */}
            </div>
            <div className="title nowrap">{value}</div>
            {children ? children : ''}
        </div>
    );
}




