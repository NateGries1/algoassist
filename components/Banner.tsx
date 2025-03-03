'use client';

import React from 'react';
import Marquee from 'react-fast-marquee';

type Props = {};

export default function Banner({}: Props) {
  return (
    <div className="pointer-events-none fixed left-0 top-0 z-0 grid min-h-screen w-full select-none place-items-center">
      <Marquee className="w-full">
        <svg
          id="Layer_2"
          data-name="Layer 2"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 3064.48 504"
          className="h-[50vh] pr-12 opacity-10"
          fill="white"  
        >
          <defs>
            <style>
              {`
                .cls-1 {
                  font-family: Montserrat-Black, Montserrat;
                  font-size: 450px;
                  font-weight: 800;
                }
                .cls-2 {
                  letter-spacing: 0em;
                }
                .cls-3 {
                  letter-spacing: 0em;
                }
              `}
            </style>
          </defs>
          <g id="Layer_1-2" data-name="Layer 1">
            <text className="cls-1" transform="translate(8.55 382.5)">
              <tspan x="0" y="0">A</tspan>
              <tspan className="cls-3" x="362.7" y="0">L</tspan>
              <tspan x="635.85" y="0">G</tspan>
              <tspan className="cls-2" x="981.9" y="0">O</tspan>
              <tspan x="1359" y="0">ASSI</tspan>
              <tspan className="cls-2" x="2470.49" y="0">S</tspan>
              <tspan x="2761.64" y="0">T</tspan>
            </text>
          </g>
        </svg>
      </Marquee>
    </div>
  );
}
