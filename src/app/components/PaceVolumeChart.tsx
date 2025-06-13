'use client';

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

export default function PaceVolumeChart({
  paceData,
  volumeData,
}: {
  paceData: { time: number; wpm: number }[];
  volumeData: { time: number; rms: number }[];
}) {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = d3.select(ref.current);
    svg.selectAll('*').remove();

    const width = 500;
    const height = 260;

    svg.attr('width', width).attr('height', height);

    const allTimes = [...paceData, ...volumeData].map((d) => d.time);
    const x = d3
      .scaleLinear()
      .domain([0, d3.max(allTimes) || 1])
      .range([50, width - 30]);

    const yPace = d3
      .scaleLinear()
      .domain([0, d3.max(paceData, (d) => d.wpm) || 1])
      .range([height - 40, 20]);

    const yVolume = d3
      .scaleLinear()
      .domain([0, d3.max(volumeData, (d) => d.rms) || 0.05])
      .range([height - 40, 20]);

    const g = svg.append('g');

    // Glow filter
    const defs = svg.append('defs');
    const glow = defs
      .append('filter')
      .attr('id', 'glow');
    glow.append('feGaussianBlur')
      .attr('stdDeviation', '3.5')
      .attr('result', 'coloredBlur');
    const feMerge = glow.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    // WPM Line
    g.append('path')
      .datum(paceData)
      .attr('fill', 'none')
      .attr('stroke', '#818cf8') // indigo-400
      .attr('stroke-width', 2.5)
      .attr('filter', 'url(#glow)')
      .attr('d', d3.line<{ time: number; wpm: number }>()
        .x((d) => x(d.time))
        .y((d) => yPace(d.wpm))
      );

    // Volume Line
    g.append('path')
      .datum(volumeData)
      .attr('fill', 'none')
      .attr('stroke', '#fbbf24') // amber-400
      .attr('stroke-width', 2.5)
      .attr('filter', 'url(#glow)')
      .attr('d', d3.line<{ time: number; rms: number }>()
        .x((d) => x(d.time))
        .y((d) => yVolume(d.rms))
      );

    // X Axis
    g.append('g')
      .attr('transform', `translate(0,${height - 40})`)
      .call(d3.axisBottom(x).ticks(6))
      .selectAll('text')
      .attr('fill', '#e0e7ff') // soft text
      .style('font-size', '12px');

    // Y Axis
    g.append('g')
      .attr('transform', `translate(50,0)`)
      .call(d3.axisLeft(yPace).ticks(5))
      .selectAll('text')
      .attr('fill', '#fce7f3') // soft pink
      .style('font-size', '12px');

    // Axis line color
    g.selectAll('path')
      .attr('stroke', '#ffffff20');

    g.selectAll('line')
      .attr('stroke', '#ffffff10');

  }, [paceData, volumeData]);

  return <svg ref={ref}></svg>;
}
