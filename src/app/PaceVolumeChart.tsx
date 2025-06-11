import React from 'react';
import { BarChart3, Volume2 } from 'lucide-react';

interface PaceData {
  time: number;
  wpm: number;
}

interface VolumeData {
  time: number;
  volume: number;
}

interface PaceVolumeChartProps {
  paceData: PaceData[];
  volumeData: VolumeData[];
}

const PaceVolumeChart: React.FC<PaceVolumeChartProps> = ({ paceData, volumeData }) => {
  // Simple visualization using CSS bars
  const maxWpm = Math.max(...paceData.map(d => d.wpm), 200);
  const maxVolume = Math.max(...volumeData.map(d => d.volume), 1);

  return (
    <div className="space-y-4">
      {/* Pace Chart */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <BarChart3 className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-700">Speaking Pace (WPM)</span>
        </div>
        <div className="flex items-end space-x-1 h-16 bg-blue-50 rounded-lg p-2">
          {paceData.slice(-20).map((data, index) => (
            <div
              key={index}
              className="bg-blue-500 rounded-t min-w-[3px] transition-all duration-300"
              style={{
                height: `${(data.wpm / maxWpm) * 100}%`,
                flex: 1
              }}
            />
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Current: {paceData.length > 0 ? Math.round(paceData[paceData.length - 1]?.wpm || 0) : 0} WPM
        </p>
      </div>

      {/* Volume Chart */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Volume2 className="w-4 h-4 text-orange-600" />
          <span className="text-sm font-medium text-orange-700">Volume Level</span>
        </div>
        <div className="flex items-end space-x-1 h-16 bg-orange-50 rounded-lg p-2">
          {volumeData.slice(-20).map((data, index) => (
            <div
              key={index}
              className="bg-orange-500 rounded-t min-w-[3px] transition-all duration-300"
              style={{
                height: `${(data.volume / maxVolume) * 100}%`,
                flex: 1
              }}
            />
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Current: {volumeData.length > 0 ? Math.round((volumeData[volumeData.length - 1]?.volume || 0) * 100) : 0}%
        </p>
      </div>
    </div>
  );
};

export default PaceVolumeChart;