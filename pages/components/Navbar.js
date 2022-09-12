import styles from '../../styles/layout.module.scss';
import Page from './Page';

export default function Navbar({ children, title=null}) {
  
  if(title)
    title = (
        <div className="navbar-title">
            {title}
        </div>
    )

  return (
    <nav className="navbar" role="navigation" aria-label="main navigation">
      <div className="navbar-brand">
        <Page path='/' className="navbar-logo" >
            <img src="logo.png" height="28" />
        </Page>

        {title}
        {children}
      </div>
    </nav>
  )
}