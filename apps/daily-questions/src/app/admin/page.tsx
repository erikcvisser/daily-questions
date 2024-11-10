import { Suspense } from 'react';
import AdminContent from './content';

export default async function AdminPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AdminContent />
    </Suspense>
  );
}
