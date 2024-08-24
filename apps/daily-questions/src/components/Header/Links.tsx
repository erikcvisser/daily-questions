'use client';
import { useState } from 'react';
import Link from 'next/link';
import classes from '../HeaderSimple/HeaderSimple.module.css';

const links = [
    { link: '/', label: 'Home' },
    { link: '/about', label: 'About' },
    { link: '/questions', label: 'My Questions' },
  ];

  
  export function Links() {
    const [active, setActive] = useState(links[0].link);

    const items = links.map((link) => (
      <a
        key={link.label}
        href={link.link}
        className={classes.link}
        data-active={active === link.link || undefined}
        onClick={(event) => {
          event.preventDefault();
          setActive(link.link);
        }}
      >
        {link.label}
      </a>
    ));

  return (
    <div>
        {items}
    </div>
  );
};
