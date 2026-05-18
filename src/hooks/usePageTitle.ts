import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export function usePageTitle(title?: string) {
  const { t } = useTranslation();

  useEffect(() => {
    const appName = t('app_name');
    if (title) {
      document.title = `${appName} | ${title}`;
    } else {
      document.title = appName;
    }
  }, [title, t]);
}
