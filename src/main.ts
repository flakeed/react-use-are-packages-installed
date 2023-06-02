import { useDeepSubscription } from '@deep-foundation/deeplinks/imports/client.js';
import { useState, useEffect, useMemo } from 'react';

export function useArePackagesInstalled(param: UseArePackagesInstalledParam) {
  const { packageNames, shouldIgnoreResultWhenLoading = false, onError } = param;
  const [packageInstallationStatuses, setPackageInstallationStatuses] = useState<PackageInstallationStatuses>(undefined);
  const { data: originalData, loading, error } = useDeepSubscription({
    type_id: {
      _id: ['@deep-foundation/core', 'Package'],
    },
    string: {
      value: {
        _in: packageNames
      },
    },
  });

  const data = useMemo(() => originalData, [originalData]);

  useEffect(() => {
    if (shouldIgnoreResultWhenLoading && loading) {
      return;
    }
    if (error) {
      onError?.({ error });
      setPackageInstallationStatuses(undefined);
      return;
    }
    let packageInstallationStatuses: PackageInstallationStatuses = {};
    packageInstallationStatuses = packageNames.reduce<PackageInstallationStatuses>((packageInstallationStatuses, packageName) => {
      packageInstallationStatuses![packageName] = !!(data && data.find(item => item.value?.value === packageName));
      return packageInstallationStatuses;
    }, packageInstallationStatuses);
    setPackageInstallationStatuses(packageInstallationStatuses);
  }, [data, loading, error]);

  return { packageInstallationStatuses, loading, error };
}

export interface UseArePackagesInstalledParam {
  packageNames: Array<string>;
  shouldIgnoreResultWhenLoading?: boolean;
  onError?: ({ error }: { error: { message: string } }) => void;
}

export type PackageInstallationStatuses = Record<string, boolean> | undefined;
