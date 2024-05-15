// @ts-nocheck
import Link from 'next/link';
import AccordionMenuItem from './AccordionItem';
import React, { useEffect, useMemo, useState } from 'react';

interface AccordionMenuProps {
  accordion: any;
  locale: string;
}

export default function AccordionMenu({
  accordion,
  locale,
}: AccordionMenuProps) {
  const [openedItems, setOpenedItems] = useState<string[]>([]);

  useEffect(() => {
    const defaultOpenedItems = accordion?.ancestors.map(item => item.id);
    setOpenedItems(defaultOpenedItems ?? []);
  }, [accordion]);

  return (
    <>
      {(accordion?.ancestors[0]?.attributes?.children?.data.length > 0
        ? accordion?.ancestors[0]?.attributes?.children?.data
        : accordion?.item?.attributes?.children?.data
      )?.map(menuItem => (
        <React.Fragment key={menuItem.id}>
          {menuItem.attributes.url.startsWith('/info') && (
            <AccordionMenuItem
              menuItem={menuItem}
              locale={locale}
              openedItems={openedItems}
              setOpenedItems={setOpenedItems}
            ></AccordionMenuItem>
          )}
        </React.Fragment>
      ))}
    </>
  );
}
