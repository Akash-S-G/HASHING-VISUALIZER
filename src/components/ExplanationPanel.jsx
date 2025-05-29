import React from 'react';

function ExplanationPanel({ currentAction }) {
  if (!currentAction) return null;
  return (
    <div className="bg-gray-100 p-3 text-sm border rounded">
      <strong>Explanation:</strong> {currentAction.message}
    </div>
  );
}

export default ExplanationPanel;