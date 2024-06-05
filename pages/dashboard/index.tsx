import DashboardLayout from '@/layouts/DashboardLayout';
import { Text } from '@mantine/core';
import React, { ReactNode } from 'react';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function Overiew({ children }: DashboardLayoutProps)  {
  return (
    <Text>Overview</Text>
  );
};

Overiew.getLayout = (page: React.ReactNode) => (
    <DashboardLayout>{page}</DashboardLayout>
  );
