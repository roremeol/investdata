import Navbar from '../components/Navbar'

import { getData } from '../lib/data_utils';
import DataSearch from '../components/DataSearch'

import utilStyles from '../styles/utils.module.scss'

export async function getStaticProps() {
  const data = [...getData('fii'), ...getData('acao')]
  return {
    props: {
      data: data.map( ({ticker,data_type,nome}) => ({ticker,data_type,nome}) )
    }
  };
}

export default function Home({ data=[] }) {
  return (
    <>
      <Navbar title={(<span className="title is-4"><span style={{color:'green'}}>Invest</span><span style={{color:'darkgreen'}}>data</span></span>)} />

      <div className={[utilStyles.im_center_in_page,utilStyles.im_data].join(' ')}>
        <DataSearch list={data} />
      </div>  
    </>
  )
}
