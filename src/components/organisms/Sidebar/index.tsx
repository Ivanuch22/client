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
    <article className=" mx-360 col-md-auto  pe-xl-3 col-sm-12 d-flex flex-wrap flex-column  align-items-center align-items-sm-start justify-content-sm-start justify-content-md-start flex-md-column col-md-auto">
      <div className="sidebar-section sidebar-section--banner pe-xl-3">
        <a href={randomBanner?.url}
          style={{ width: "100%", display: "block" }}
          target="_blank">
          <Image
            loading="lazy"
            className="sidebar-banner"
            src={randomBanner?.image}
            width={300}
            height={250}
            alt={randomBanner?.alt}
            style={{ width: "100%", height: "auto" }}
          />
        </a>
      </div>
      {/* You can put it whatever you want */}
      {children}
    </article>

  );
}
