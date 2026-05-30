'use client';

import { useState } from 'react';
import InvoiceEcosystemSidebar from './EcosystemSidebar';
import InvoiceEcosystemPanel from './EcosystemPanel';
import { ECO_TOOLS } from '@/lib/invoice/ecosystemTools';

export default function InvoiceEcosystemWrapper() {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedTool = ECO_TOOLS.find(t => t.id === selectedId) ?? null;

  const handleSelect = (id: string) => setSelectedId(prev => prev === id ? null : id);
  const handleClose = () => setSelectedId(null);

  return (
    <>
      <InvoiceEcosystemSidebar selectedId={selectedId} onSelect={handleSelect} />
      <InvoiceEcosystemPanel tool={selectedTool} isOpen={selectedId !== null} onClose={handleClose} />
    </>
  );
}
