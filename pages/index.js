import Navbar from './components/Navbar'

import { getData } from './lib/fiis';
import FiiSearch from './components/FiiSearch'

import utilStyles from '../styles/utils.module.scss'

export async function getStaticProps() {
  const fiis = getData('fii');
  return {
    props: {
      fiis,
    },
  };
}

export default function Home({ fiis=[] }) {
  return (
    <>
      <Navbar title={(<span className="title is-4"><span style={{color:'green'}}>Invest</span><span style={{color:'darkgreen'}}>data</span></span>)} />

      <div className={[utilStyles.im_center_in_page,utilStyles.im_data].join(' ')}>
        <FiiSearch fiis={fiis} />
      </div>  
    </>
  )
}
