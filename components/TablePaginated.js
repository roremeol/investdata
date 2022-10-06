import React, { useState, useEffect, useRef } from 'react'

import tableStyle from '../styles/tablepagineted.module.scss'

export default function TablePaginated({ header=[], body=[] }) {
    
    const [state, setState] = useState({
        lines:0,
        cols:0,
        visible:5,
        page:1,
        pagination:3,
    })
    // const [slide, setHeight] = useState(0)
    const table = useRef(null)
    
    useEffect(() => {
        // setHeight(ref.current.clientHeight)
        // console.log("myTable", table.current.);
        setState({
            lines:body.length,
            cols:body.length > 0 ? body[0].length : 0,
            visible:5,
            page:1,
            pagination:3,
        })
    },[body])

    const onPageClick = (e) => {
        const page = e.target.getAttribute("data-index")
        if(page!=state.page)
        {   
            const { lines, visible } = state
            let { pagination } = state

            if(page==pagination && lines-(state.page*visible)>pagination)
                pagination++
            else if(page<pagination && pagination>3)
                pagination--

            if(page==1)
                pagination=3

            setState({
                ...state,
                page,
                pagination
            })

        }
    }

    return (
        <>
            <table 
                className={['table',tableStyle.table].join(' ')} 
                style={{height:'250px'}}
                ref={table}        
            >
                <thead>
                    <tr>
                        { header.map( (h,idx) => <th key={`h-${idx}`}>{h}</th>) }
                    </tr>
                </thead>
                <tbody>
                    {body.map( (b=[],b_idx) => <tr key={b_idx} style={{display:b_idx<(state.page*state.visible)&&b_idx>=((state.page-1)*state.visible)?'table-row':'none'}}>{b.map( (d,d_idx) => <td key={b_idx*state.cols+d_idx} data-index={b_idx*state.cols+d_idx}>{d}</td>)}</tr> )}
                </tbody>
            </table>
            <nav className="pagination is-centered is-small" role="navigation" aria-label="pagination">
                <ul className="pagination-list">
                    <li style={{visibility:state.page>=3?'visible':'hidden'}}>
                        <span key={`p-left`} data-index={1} className="pagination-link" onClick={onPageClick}>&lt;&lt;</span>
                    </li>
                    {body.slice(0,body.length/5).map( (_,idx) => <li><a key={`p-${idx}`} data-index={idx+1} onClick={onPageClick} className={["pagination-link",idx==(state.page-1)?'is-current':''].join(' ')}>{idx+1}</a></li>).slice((state.pagination-3),state.pagination)}
                    <li style={{visibility:(state.lines-(state.page*state.visible))>state.pagination?'visible':'hidden'}}>
                        <span key={`p-ellipsis`} className="pagination-ellipsis" onClick={onPageClick}>&hellip;</span>
                    </li>
                    {body.slice(0,body.length/5).map( (_,idx) => <li><a key={`p-${idx}`} data-index={idx+1} onClick={onPageClick} className={["pagination-link",idx==(state.page-1)?'is-current':''].join(' ')}>{idx+1}</a></li>).slice(-4,-1)}
                </ul>
            </nav>
        </>
    );
}