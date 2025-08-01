'use client';

import { useState } from 'react';
import { OrganizationList } from '@/components/organizations/OrganizationList';
import { OrganizationDashboard } from '@/components/organizations/OrganizationDashboard';
import type { Organization } from '@/types';

export default function OrganizationsPage() {
  const [selectedOrganization, setSelectedOrganization] = useState<Organization | null>(null);

  if (selectedOrganization) {
    return (
      <OrganizationDashboard
        organizationId={selectedOrganization.id}
        onBack={() => setSelectedOrganization(null)}
      />
    );
  }

  return (
    <OrganizationList
      onSelectOrganization={setSelectedOrganization}
    />
  );
}