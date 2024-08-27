// @ts-nocheck
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useEffect, useState, useCallback } from 'react';
import $t from '@/locale/global';
import Switch from '@/pages/switch';

interface SubmenuState {
  [id: number]: number | null; // Зберігає id останнього відкритого підменю
}

function Menu({ data, show, onTog, allPages }) {
  const [openSubmenu, setOpenSubmenu] = useState<SubmenuState>({});

  const SERVICES_ID = 904765767;
  const router = useRouter();
  const locale = router.locale === 'ua' ? 'uk' : router.locale;

  const toggleSubmenu = useCallback((parentId: number, id: number) => {
    setOpenSubmenu(prevState => ({
      ...prevState,
      [parentId]: prevState[parentId] === id ? null : id,
      [SERVICES_ID]: null
    }));
  }, []);

  const handleClick = useCallback(event => {
    if (!event.target.classList.contains('navpart')) {
      onTog();
      setOpenSubmenu({});
    }
  }, [onTog]);

  useEffect(() => {
    document.body.addEventListener('click', handleClick);
    document.body.addEventListener('touchstart', handleClick);

    return () => {
      document.body.removeEventListener('click', handleClick);
      document.body.removeEventListener('touchstart', handleClick);
    };
  }, [handleClick]);

  useEffect(() => {
    setOpenSubmenu({});
  }, [router]);

  const hasValidChildren = useCallback(item => {
    return item?.attributes?.children?.data.some(child => {
      const childUrl = child.attributes.url;
      return (
        allPages.some(page => page.attributes.url === childUrl) ||
        hasValidChildren(child) ||
        item?.attributes?.url === '/usefull'
      );
    });
  }, [allPages]);

  const renderMenuItem = useCallback((item, parentId: number | null) => {
    const hasChildren = hasValidChildren(item);
    if (hasChildren && !item.attributes.url.startsWith('/info')) {
      const isOpen = openSubmenu[parentId] === item.id;

      return (
        <div className="nav-item dropdown" key={item.id} style={{ position: 'relative' }}>
          <span
            className="nav-link dropdown-toggle navpart"
            style={{ cursor: 'pointer' }}
            onClick={() => toggleSubmenu(parentId, item.id)}
          >
            {locale === 'ru' ? item.attributes.title : item.attributes[`title_${locale}`]}
          </span>
          <ul className={`dropdown-menu ${isOpen ? 'show' : ''}`} style={{ position: 'absolute', right: 0, top: '100%', listStyleType: 'none' }}>
            {item.attributes.children.data.map(child => (
              <li key={child.id}>{renderMenuItem(child, item.id)}</li>
            ))}
          </ul>
        </div>
      );
    } else if (
      allPages.some(
        page =>
          page.attributes.url === item.attributes.url ||
          item.attributes.url === '/services' ||
          item.attributes.url.startsWith('/info')
      )
    ) {
      const title = locale === 'ru' ? item.attributes.title : item.attributes[`title_${locale}`];
      if (title === 'nopage') return null;

      return (
        <Link href={item.attributes.url} className="nav-link navpart" key={item.id} onClick={onTog}>
          {title}
        </Link>
      );
    }
  }, [allPages, locale, openSubmenu, toggleSubmenu]);

  return (
    <div className={`collapse navbar-collapse navpart ${show ? 'show' : ''}`} id="navbarCollapse">
      {data && (
        <div className="navbar-nav ms-auto py-0" style={{ alignItems: 'center' }}>
          <Link href="/" className="nav-item nav-link navpart">
            {$t[locale].menu.main}
          </Link>

          {data.map(item => renderMenuItem(item, null))}

          <Link href="/blog" className="nav-item nav-link navpart">
            {$t[locale].blog.titleName}
          </Link>

          <Link href="/contacts" className="nav-item nav-link navpart">
            {$t[locale].menu.contacts}
          </Link>

          <div className="flex justify-center align-center w-full mx-auto toggler-wrap">
            <Switch />
          </div>
        </div>
      )}
    </div>
  );
}

export default Menu;
