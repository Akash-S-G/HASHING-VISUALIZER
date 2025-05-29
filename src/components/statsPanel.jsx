import React from 'react';

function StatsPanel({ stats }) {
  return (
    <div className="text-xs text-gray-600">
      Collisions: {stats.collisions} | Load Factor: {stats.loadFactor}
    </div>
  );
}

export default StatsPanel;
