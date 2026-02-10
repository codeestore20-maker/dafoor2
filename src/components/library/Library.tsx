import React from 'react';
import { ScrapbookLayout } from './ScrapbookLayout';
import { usePageTitle } from '../../hooks/usePageTitle';
import { useTranslation } from 'react-i18next';

export function Library() {
  const { t } = useTranslation();
  usePageTitle(t('dashboard'));
  return <ScrapbookLayout />;
}
