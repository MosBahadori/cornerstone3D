import type { Types } from '@cornerstonejs/core';

import _getHash from './_getHash';
import setNewAttributesIfValid from './setNewAttributesIfValid';
import setAttributesIfNecessary from './setAttributesIfNecessary';
import type { SVGDrawingHelper } from '../types';

export default function drawHipCup(
  svgDrawingHelper: SVGDrawingHelper,
  annotationUID: string,
  HipCupUID: string,
  start: Types.Point2,
  end: Types.Point2,
  options: {
    color?: string;
    fillColor?: string;
    fillOpacity?: number;
    width?: number;
    lineWidth?: number;
    lineDash?: string;
    closePath?: boolean;
  },
  dataId = ''
): void {
  // if length is NaN return
  if (isNaN(start[0]) || isNaN(start[1]) || isNaN(end[0]) || isNaN(end[1])) {
    return;
  }

  function generatePath(
    x1: number,
    y1: number,
    x2: number,
    y2: number
  ): string {
    // Radius of the arc
    const radius = (x2 - x1) / 2;

    // Center of the arc
    const cx = x1 + radius;
    const cy = y1; // Same y as start

    // Points for the flat bottom section
    const flatBottom1 = { x: x2 - 10, y: y2 + 10 };
    const flatBottom2 = { x: x1 + 10, y: y1 + 10 };

    // Construct the path
    const path = [
      `M ${x1} ${y1}`, // Move to start
      `A ${radius} ${radius} 0 0 1 ${x2} ${y2}`, // Arc
      `L ${flatBottom1.x} ${flatBottom1.y}`, // Line to flat-bottom point 1
      `L ${flatBottom2.x} ${flatBottom2.y}`, // Line to flat-bottom point 2
      `Z`, // Close the path
    ].join(' ');

    return path;
  }

  const {
    color = 'rgb(0, 255, 0)',
    width = 10,
    fillColor = 'none',
    fillOpacity = 0,
    lineWidth,
    lineDash,
    closePath = false,
  } = options;

  // for supporting both lineWidth and width options
  const strokeWidth = lineWidth || width;

  const svgns = 'http://www.w3.org/2000/svg';
  const svgNodeHash = _getHash(annotationUID, 'hipCup', HipCupUID);
  const existingNode = svgDrawingHelper.getSvgNode(svgNodeHash);

  const pointsAttribute = generatePath(start[0], start[1], end[0], end[1]);

  const attributes = {
    d: pointsAttribute,
    stroke: color,
    fill: fillColor,
    'fill-opacity': fillOpacity,
    'stroke-width': strokeWidth,
    'stroke-dasharray': lineDash,
  };

  if (existingNode) {
    // This is run to avoid re-rendering annotations that actually haven't changed
    setAttributesIfNecessary(attributes, existingNode);

    svgDrawingHelper.setNodeTouched(svgNodeHash);
  } else {
    const newNode = document.createElementNS(svgns, 'path');

    setNewAttributesIfValid(attributes, newNode);
    svgDrawingHelper.appendNode(newNode, svgNodeHash);
  }
}
