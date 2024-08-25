// @ts-nocheck
import Image from 'next/image';
import useTouchClickHandler from '@/hooks/useTouchClickHandler';
import useDefaultLayoutContext from '@/hooks/useDefaultLayoutContext';
import Link from 'next/link';


const Call = () => {
  const {
    isActive,
    setActive,
    handleMouseOver,
    handleMouseOut,
    handleTouchStart,
  } = useTouchClickHandler();


  const {
    socialData
  } = useDefaultLayoutContext();

  if (!socialData) { return null; }
  
  return (
      <div className="callback-wrap"
        onMouseOver={handleMouseOver}
        onMouseOut={handleMouseOut}
      >
        <div
          className={`callback-bt ${isActive && 'active'}`}
          onTouchStart={handleTouchStart}
        >
          <div className={`text-call`} style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
            <i className="fas fa-comments" style={{color: '#f8f8f8', fontSize: '4rem'}}></i>
          </div>
          <div className="social-icons callback-icons">
            <Link href={socialData?.telegram} className="icon1 callback-icon" onTouchStart={() => { window.location.href = socialData?.telegram }}>
              <Image loading="lazy"  src="/img/telegram.webp" alt="Telegram" width={34} height={34} style={{ pointerEvents: 'none' }} />
            </Link>
            <Link href={socialData?.facebook} className="icon5 callback-icon" onTouchStart={() => { window.location.href = socialData?.facebook }}>
              <Image loading="lazy"  src="/img/face.webp" alt="Facebook" width={34} height={34} style={{ pointerEvents: 'none' }} />
            </Link>
            <Link href={socialData?.viber} className="icon4 callback-icon" onTouchStart={() => { window.location.href = socialData?.viber }}>
              <Image loading="lazy"  src="/img/viber.webp" alt="Viber" width={34} height={34} style={{ pointerEvents: 'none' }} />
            </Link>
            <Link href={socialData?.whatsup} className="icon2 callback-icon" onTouchStart={() => { window.location.href = socialData?.whatsup }}>
              <Image loading="lazy"  src="/img/what.webp" alt="WhatsApp" width={34} height={34} style={{ pointerEvents: 'none' }} />
            </Link>
            <Link href={socialData?.skype} className="icon3 callback-icon" onTouchStart={() => { window.location.href = socialData?.skype }}>
              <Image loading="lazy"  src="/img/skype.webp" alt="Skype" width={34} height={34} style={{ pointerEvents: 'none' }} />
            </Link>
          </div>
        </div>
      </div>
  );
};

export default Call;
