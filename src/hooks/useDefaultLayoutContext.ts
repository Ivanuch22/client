import React, { useContext } from 'react';
import DefaultLayoutContext from '@/contexts/DefaultLayoutContext';

export default function useDefaultLayoutContext() {
  const context = useContext(DefaultLayoutContext);
  if (!context) {
    throw new Error(
      'useDefaultLayoutContext must be used with a DefaultLayoutContextProvider'
    );
  }
  return context;
}
