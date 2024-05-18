//@ts-nocheck

import React, { useState, useRef } from 'react';
import ReactCrop, {
  centerCrop,
  makeAspectCrop,
  Crop,
  PixelCrop,
} from 'react-image-crop';
import { canvasPreview } from './canvasPreview';
import { useDebounceEffect } from './useDebounceEffect';
import $t from '@/locale/global';
import { useRouter } from 'next/router';

import 'react-image-crop/dist/ReactCrop.css';

function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number
) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight
    ),
    mediaWidth,
    mediaHeight
  );
}

export default function ImgEditor({ handleUpload, isShow, onClose }) {
  const [imgSrc, setImgSrc] = useState('');
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const hiddenAnchorRef = useRef<HTMLAnchorElement>(null);
  const blobUrlRef = useRef('');
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [scale, setScale] = useState(1);
  const [rotate, setRotate] = useState(0);
  const [aspect, setAspect] = useState<number | undefined>(1 / 1);
  const router = useRouter();
  const locale = router.locale === 'ua' ? 'uk' : router.locale;
  function onSelectFile(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      setCrop(undefined); 
      const reader = new FileReader();
      reader.addEventListener('load', () =>
        setImgSrc(reader.result?.toString() || '')
      );
      reader.readAsDataURL(e.target.files[0]);
    }
  }

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    if (aspect) {
      const { width, height } = e.currentTarget;
      setCrop(centerAspectCrop(width, height, aspect));
    }
  }

  async function onDownloadCropClick() {
    const image = imgRef.current;
    const previewCanvas = previewCanvasRef.current;
    if (!image || !previewCanvas || !completedCrop) {
      throw new Error('Crop canvas does not exist');
    }
  
    const targetWidth = 180;
    const targetHeight = 180;
  
    const offscreen = new OffscreenCanvas(targetWidth, targetHeight);
    const ctx = offscreen.getContext('2d');
    if (!ctx) {
      throw new Error('No 2d context');
    }
  
    // Adjusting scale factors to fit the crop in 180x180px canvas
    const scaleX = targetWidth / completedCrop.width;
    const scaleY = targetHeight / completedCrop.height;
  
    ctx.drawImage(
      image,
      completedCrop.x * (image.naturalWidth / image.width),
      completedCrop.y * (image.naturalHeight / image.height),
      completedCrop.width * (image.naturalWidth / image.width),
      completedCrop.height * (image.naturalHeight / image.height),
      0,
      0,
      targetWidth,
      targetHeight
    );
  
    const blob = await offscreen.convertToBlob({ type: "image/jpeg", quality: 0.6 });
  
    const formData = new FormData();
    formData.append('files', blob, 'image.jpeg');
  
    handleUpload(formData);
  
    setImgSrc('');
    document.querySelector('input[type="file"]').value = '';
  }
  

  useDebounceEffect(
    async () => {
      if (
        completedCrop?.width &&
        completedCrop?.height &&
        imgRef.current &&
        previewCanvasRef.current
      ) {
        // We use canvasPreview as it's much faster than imgPreview.
        canvasPreview(
          imgRef.current,
          previewCanvasRef.current,
          completedCrop,
          scale,
          rotate
        );
      }
    },
    100,
    [completedCrop, scale, rotate]
  );

  return (
    <div
      id="ConfirmModal"
      className="modal fade show"
      style={{
        padding: "0 10px",
        background: 'rgba(0, 0, 0, .3)',
        display: isShow ? 'block' : 'none',
      }}
    >
      <div className="modal-dialog modal-confirm" style={{top:5,marginTop: 50}}>
      <div className="icon-box" style={{top: -50,}}>
              <i className="fas fa-check"></i>
            </div>
        <div className="modal-content" style={{maxHeight: "87vh",overflowY: "scroll"}}>
        <div className="modal-header">
                <button type="button" className="btn-close" aria-label="Close" onClick={onClose}></button>
            </div>
          <div className="modal-header">

            <h4 className="modal-title w-100" style={{margin: "0px 0 -15px"}}>{$t[locale].auth.choosePhoto}</h4>
          </div>
          <div className="modal-body">
            <div className="ImgEditor">
              <div className="Crop-Controls">
                <input type="file" accept="image/*" onChange={onSelectFile} />
              </div>
              {!!imgSrc && (
                <>
                  <ReactCrop
                    crop={crop}
                    onChange={(_, percentCrop) => setCrop(percentCrop)}
                    onComplete={c => setCompletedCrop(c)}
                    aspect={aspect}
                    minHeight={80}
                  >
                    <img
                      ref={imgRef}
                      alt="Crop me"
                      src={imgSrc}
                      style={{
                        transform: `scale(${scale}) rotate(${rotate}deg)`,
                      }}
                      onLoad={onImageLoad}
                    />
                  </ReactCrop>
                  <button
                    onClick={onDownloadCropClick}
                    className="btn btn-success"
                    style={{marginTop: 10}}
                  >
                    {$t[locale].auth.saveChanges}
                  </button>
                </>
              )}
              {!!completedCrop && (
                <div style={{display: "none"}}>
                  <div>
                    <canvas
                      ref={previewCanvasRef}
                      style={{
                        border: '1px solid black',
                        objectFit: 'contain',
                        width: completedCrop.width,
                        height: completedCrop.height,
                      }}
                    />
                  </div>
                  <div>
                    <button onClick={onDownloadCropClick}>Download Crop</button>
                    <div style={{ fontSize: 12, color: '#666' }}>
                      If you get a security error when downloading try opening
                      the Preview in a new tab (icon near top right).
                    </div>
                    <a
                      href="#hidden"
                      ref={hiddenAnchorRef}
                      download
                      style={{
                        position: 'absolute',
                        top: '-200vh',
                        visibility: 'hidden',
                      }}
                    >
                      Hidden download
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
