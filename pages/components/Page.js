import styles from '../../styles/layout.module.scss';
import Link from 'next/link';

export default function Page({ children, path='/', back=false, data=false, className='' }) {

  const href = {
    pathname: path
  };
  if(data)
    href['query'] = data;

  return (
    <Link href={href}>
      <a className={className}>{children}</a>
    </Link>
  )
}