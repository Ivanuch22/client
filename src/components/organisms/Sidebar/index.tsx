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
    <article className="sidebar col-md-auto pe-md-3 col-sm-12 d-flex flex-wrap flex-column flex-sm-row align-items-center align-items-sm-start justify-content-sm-start justify-content-md-start flex-md-column">
      {/* displaying randomBanner */}
      <div className="sidebar-section sidebar-section--banner">
        <a href={randomBanner?.url} target="_blank">
          <img
            className="sidebar-banner"
            src={randomBanner?.image}
            width={300}
            height={250}
            alt={randomBanner?.alt}
          />
        </a>
      </div>
      {/* You can put it whatever you want */}
      {children}
    </article>
  );
}
