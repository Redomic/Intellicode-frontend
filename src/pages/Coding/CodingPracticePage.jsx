import React from 'react';
import CodingInterface from '../../components/coding/CodingInterface';

/**
 * CodingPracticePage - Full page wrapper for the coding interface
 */
const CodingPracticePage = () => {
  return (
    <div className="h-screen bg-zinc-900">
      {/* Coding Interface - now has its own header/navbar */}
      <CodingInterface />
    </div>
  );
};

export default CodingPracticePage;
