// @ts-nocheck
import Image from 'next/image';
import useTouchClickHandler from '@/hooks/useTouchClickHandler';
import useDefaultLayoutContext from '@/hooks/useDefaultLayoutContext';


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
            <a href={socialData.telegram} className="icon1 callback-icon" onTouchStart={() => { window.location.href = socialData.telegram }}>
              <Image src="/img/telegram.png" alt="Telegram" width={34} height={34} style={{ pointerEvents: 'none' }} />
            </a>
            <a href={socialData.facebook} className="icon5 callback-icon" onTouchStart={() => { window.location.href = socialData.facebook }}>
              <Image src="/img/face.png" alt="Facebook" width={34} height={34} style={{ pointerEvents: 'none' }} />
            </a>
            <a href={socialData.viber} className="icon4 callback-icon" onTouchStart={() => { window.location.href = socialData.viber }}>
              <Image src="/img/viber.png" alt="Viber" width={34} height={34} style={{ pointerEvents: 'none' }} />
            </a>
            <a href={socialData.whatsup} className="icon2 callback-icon" onTouchStart={() => { window.location.href = socialData.whatsup }}>
              <Image src="/img/what.png" alt="WhatsApp" width={34} height={34} style={{ pointerEvents: 'none' }} />
            </a>
            <a href={socialData.skype} className="icon3 callback-icon" onTouchStart={() => { window.location.href = socialData.skype }}>
              <Image src="/img/skype.png" alt="Skype" width={34} height={34} style={{ pointerEvents: 'none' }} />
            </a>
          </div>
        </div>
      </div>
  );
};

export default Call;
