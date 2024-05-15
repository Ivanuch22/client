import { SyntheticEvent, useEffect, useRef, useState } from "react";
import useDevice from "./useDevice";

const useTouchClickHandler = () => {
    const {
        isMobile,
    } = useDevice();

    
    const [isActive, setActive] = useState<boolean>(false);

    const handleMouseOver = () => {
        if(isMobile){ return; }
        setActive(true);
    }
    const handleMouseOut = () => {
        if(isMobile){ return; }
        setActive(false);
    }

    const handleTouchStart = (event: any) => {
        if(!isMobile){ return; }
        setActive(!isActive);
    }


  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (isActive && !event.target.closest('.callback-bt')) {
        setActive(false);
      }
    };

    window.addEventListener('click', handleClickOutside);

    return () => {
      window.removeEventListener('click', handleClickOutside);
    };
  }, [isActive, setActive]);
    
    return {
        handleMouseOut,
        handleMouseOver,
        handleTouchStart,

        isActive,
        setActive,
    };
};

export default useTouchClickHandler;
