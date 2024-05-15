// @ts-nocheck

import { useEffect } from 'react';
import { useState } from 'react';
import Menu from '../menu';
import Link from 'next/link';
import { useRouter } from 'next/router';
import SearchModal from '../search-modal';
import { useWindowSize } from '@uidotdev/usehooks';
import useDefaultLayoutContext from '@/hooks/useDefaultLayoutContext';
import $t from '@/locale/global';
import { useAuth } from '@/contexts/AuthContext';

interface SubmenuItem {
  id: number;
  attributes: {
    title: string;
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
    locale: string;
    url: string;
  };
}
interface MenuItem {
  id: number;
  attributes: {
    title: string;
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
    locale: string;
    url: string;
    children: {
      data: SubmenuItem[];
    };
  };
}
interface Menu {
  data: MenuItem;
}

interface HeaderProps {}

const Header = ({}: HeaderProps) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showProfile, setShowProfile] = useState("")

  const { isLogin, logout,userData } = useAuth();
  const {menu, allPages} = useDefaultLayoutContext();
  const router = useRouter();
  const locale = router.locale === 'ua' ? 'uk' : router.locale;

  const size = useWindowSize();

useEffect(()=>{
  if(userData){
    const name = JSON.parse(userData)
    setShowProfile( name.real_user_name||"")
  }
},[isLogin,userData])
  return (
    <header>
    <nav className="navbar navbar-expand-xl navbar-light ">
      <Link href="/" className="navbar-brand p-0">
        <h1 className="m-0">
          <i className="fa fa-globe"></i> Trans-Hope
        </h1>
      </Link>
      <button
        className="navbar-toggler navpart"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarCollapse"
        onClick={() => setShowMenu(!showMenu)}
      >
        <span className="fa fa-bars navpart"></span>
      </button>
      <Menu
        data={menu}
        show={showMenu}
        allPages={allPages}
        onTog={() => {
          setShowMenu(false);
        }}
      />
      <SearchModal onClose={() => setShowModal(false)} show={showModal} />

      {size.width >= 1200 ? (
          <>
            <button
                type="button"
                className=" btn text-secondary search-btn navpart"
                onClick={() => setShowModal(!showModal)}
            >
              <i className="fa fa-search navpart"></i>
            </button>
            {isLogin ? <Link
                href="/profile"
                className=" btn text-secondary search-btn navpart"
            >
              {showProfile}
            </Link> : <Link
                href="/login"
                className=" btn text-secondary search-btn navpart"
            >
              {$t[locale].auth.header_button_name}
            </Link>}
          </>


      ) : (
          !!showMenu && (
              <>
                <button
                    type="button"
                    className="header_left_button btn text-secondary search-btn navpart"
                    onClick={() => setShowModal(!showModal)}
                >
                  <i className="fa fa-search navpart"></i>
                </button>
                {isLogin ? <Link
                    href="/profile"
                    className="header_rigth_button btn text-secondary search-btn navpart"
                >
                  {showProfile}
                </Link> : <Link
                    href="/login"
                    className="header_rigth_button btn text-secondary search-btn navpart"
                >
                  {$t[locale].auth.header_button_name}
                </Link>}
              </>
        )
      )}




    </nav>
    </header>

  );
};

export default Header;
