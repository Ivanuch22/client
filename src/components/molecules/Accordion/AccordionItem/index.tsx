import Link from 'next/link';
import React, { useMemo, useState } from 'react';

interface AccordionMenuItemProps {
  menuItem: any;
  locale: string;
  openedItems: string[]
  setOpenedItems: React.Dispatch<React.SetStateAction<string[]>>
}

export default function AccordionMenuItem({
  menuItem,
  locale,
  openedItems,
  setOpenedItems
}: AccordionMenuItemProps) {

  function handleMenuItemClick(itemId: string): void {
    const itemIndex = openedItems.indexOf(itemId);
    if (itemIndex !== -1) {
      setOpenedItems(openedItems.filter(id => id !== itemId));
    } else {
      setOpenedItems([...openedItems, itemId]);
    }
  }

  function renderAccordionMenuItem(menuItem: any, locale: string) {
    const hasChildren: boolean = menuItem.attributes.children.data.length > 0;
    return hasChildren ? (
      <React.Fragment>
        <button
          className={`button ${
            openedItems.includes(menuItem.id) ? 'button--opened' : ''
          }`}
          onClick={() => handleMenuItemClick(menuItem.id)}
        >
          <span>
            {locale === 'ru'
              ? menuItem.attributes.title
              : menuItem.attributes[`title_${locale}`]}{' '}
          </span>
        </button>
        <div className={`smenu`}>
          {menuItem.attributes.children.data.map((child: any) => (
            <>
              {child.attributes.url.startsWith('/info') &&
                (child.attributes.children.data.length > 0 ? (
                  renderAccordionMenuItem(child, locale)
                ) : (
                  <Link href={child.attributes.url} key={child.id}>
                    {locale === 'ru'
                      ? child.attributes.title
                      : child.attributes[`title_${locale}`]}{' '}
                  </Link>
                ))}
            </>
          ))}
        </div>
      </React.Fragment>
    ) : (
      <Link href={menuItem.attributes.url} className="button">
        {locale === 'ru'
          ? menuItem.attributes.title
          : menuItem.attributes[`title_${locale}`]}{' '}
      </Link>
    );
  }

  return (
    <li className="item" id={menuItem.id}>
      {/* go recursively and display accordion menu */}
      {renderAccordionMenuItem(menuItem, locale)}
    </li>
  );
}
