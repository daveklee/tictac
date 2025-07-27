import React from 'react';
import { Grid3X3, Grid } from 'lucide-react';

interface GridSizeSelectorProps {
  gridSize: number;
  onGridSizeChange: (size: number) => void;
}

export const GridSizeSelector: React.FC<GridSizeSelectorProps> = ({
  gridSize,
  onGridSizeChange
}) => {
  const gridSizes = [3, 4, 5, 6, 7, 8, 9, 10];

  return (
    <div className="bg-white rounded-xl p-3 sm:p-4 shadow-lg border-2 border-gray-200 mb-3 sm:mb-4">
      <div className="flex items-center gap-2 mb-2">
        <Grid size={16} className="text-gray-600" />
        <span className="text-sm font-semibold text-gray-700">Grid Size:</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {gridSizes.map((size) => (
          <button
            key={size}
            onClick={() => onGridSizeChange(size)}
            className={`px-3 py-1.5 rounded-lg font-semibold text-sm transition-all duration-200 ${
              gridSize === size
                ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {size}×{size}
          </button>
        ))}
      </div>
    </div>
  );
};