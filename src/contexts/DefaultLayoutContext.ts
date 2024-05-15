import { Dispatch, SetStateAction, createContext } from 'react';

interface DefaultLayoutContextParams {
  footerMenus: any;
  footerGeneral: any;
  allPages: any;
  menu: any;
  errorMessage?: string;
  setErrorMessage?: Dispatch<SetStateAction<string>>;
  errorCode?: number | null
  setErrorCode?: Dispatch<SetStateAction<number | null>>;
  socialData: object | null;
}

const DefaultLayoutContext = createContext<DefaultLayoutContextParams>({
  footerMenus: {
    about: { title: '', items: [] },
    services: { title: '', items: [] },
    contacts: {},
  },
  footerGeneral: {},
  allPages: [],
  menu: [],
  errorMessage: '',
  setErrorMessage: () => {},
  errorCode: null,
  setErrorCode: () => {},
  socialData: null,
});

export default DefaultLayoutContext;
