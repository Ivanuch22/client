import { useEffect, useState } from "react"



const useDevice = () => {
    const hasWindow = typeof window !== 'undefined';

    const [width, setWidth] = useState(hasWindow ? window.innerWidth : 0);
    const [height, setHeight] = useState(hasWindow ? window.innerHeight : 0);

    const [isMobile, setIsMobile] = useState<boolean>(() => width <= 1200);

    const handleWidnowResize = () => {
        setWidth(window.innerWidth);
        setHeight(window.innerHeight);
    }

    useEffect(() => {
        window.addEventListener('resize', handleWidnowResize);

        return () => {
            window.removeEventListener('resize', handleWidnowResize);
        }
    }, [])
    return {
        isMobile
    }
}

export default useDevice;