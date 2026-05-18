import React from 'react';
import { WorkspaceLayout } from '../workspace/WorkspaceLayout';
import { usePageTitle } from '../../hooks/usePageTitle';
import { useTranslation } from 'react-i18next';

export function Library() {
  const { t } = useTranslation();
  usePageTitle(t('dashboard'));
  return <WorkspaceLayout />;
}
