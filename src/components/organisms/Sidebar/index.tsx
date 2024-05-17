import Image from 'next/image';

interface Banner {
  url: string;
  image: string;
  alt: string;
}

interface SidebarProps {
  randomBanner: any;
  children?: React.ReactNode;
}

export default function Sidebar({ randomBanner, children }: SidebarProps) {
  return (
    <div className=' col-md-auto' >
    <article className=" col-md-auto  pe-xl-3 col-sm-12 d-flex flex-wrap flex-column flex-sm-row align-items-center align-items-sm-start justify-content-sm-start justify-content-md-start flex-md-column col-md-auto">
      <div className="sidebar-section sidebar-section--banner pe-xl-3">
        <a href={randomBanner?.url} 
            style={{width: "100%", display: "block"}}
            target="_blank">
          <img
            className="sidebar-banner"
            src={randomBanner?.image}
            width={300}
            height={250}
            alt={randomBanner?.alt}
            style={{width: "100%"}}
          />
        </a>
      </div>
      {/* You can put it whatever you want */}
      {children}
    </article>
    </div>

  );
}
