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

    const width = 400;
    const height = 200;

    svg.attr('width', width).attr('height', height);

    // X scale
    const allTimes = [...paceData, ...volumeData].map((d) => d.time);
    const x = d3
      .scaleLinear()
      .domain([0, d3.max(allTimes) || 1])
      .range([40, width - 10]);

    // Y scale for WPM
    const yPace = d3
      .scaleLinear()
      .domain([0, d3.max(paceData, (d) => d.wpm) || 1])
      .range([height - 20, 20]);

    // Y scale for RMS
    const yVolume = d3
      .scaleLinear()
      .domain([0, d3.max(volumeData, (d) => d.rms) || 0.05])
      .range([height - 20, 20]);

    // WPM line
    svg
      .append('path')
      .datum(paceData)
      .attr('fill', 'none')
      .attr('stroke', '#4f46e5')
      .attr('stroke-width', 2)
      .attr(
        'd',
        d3
          .line<{ time: number; wpm: number }>()
          .x((d) => x(d.time))
          .y((d) => yPace(d.wpm))
      );

    // Volume line
    svg
      .append('path')
      .datum(volumeData)
      .attr('fill', 'none')
      .attr('stroke', '#f59e42')
      .attr('stroke-width', 2)
      .attr(
        'd',
        d3
          .line<{ time: number; rms: number }>()
          .x((d) => x(d.time))
          .y((d) => yVolume(d.rms))
      );

    // Axes
    svg
      .append('g')
      .attr('transform', `translate(0,${height - 20})`)
      .call(d3.axisBottom(x));
    svg.append('g').attr('transform', `translate(40,0)`).call(d3.axisLeft(yPace));
  }, [paceData, volumeData]);

  return <svg ref={ref}></svg>;
}
