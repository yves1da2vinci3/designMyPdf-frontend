import React from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { NextPage } from 'next';

const TemplateHome = () => {
  return <div>TemplateHome</div>;
};

TemplateHome.getLayout = (page: React.ReactNode) => <DashboardLayout>{page}</DashboardLayout>;

export default TemplateHome;
