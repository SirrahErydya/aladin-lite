/******************************************************************************
 * Aladin Lite project
 * 
 * File GenericPointer.js
 * 
 ******************************************************************************/

import { SimbadPointer } from "./SimbadPointer.js";
import { PlanetaryFeaturesPointer } from "./PlanetaryFeaturesPointer.js";
import { Utils } from './Utils';

// allow to call either Simbad or Planetary features Pointers
export let GenericPointer = (function (view, e) {
    const xymouse = Utils.relMouseCoords(view.imageCanvas, e);
    let radec = view.wasm.screenToWorld(xymouse.x, xymouse.y);
    if (radec) {
        // sky case
        if (view.aladin.getBaseImageLayer().isPlanetaryBody() === false) {
            const queryRadius = Math.min(1, 15 * view.fov / view.largestDim);
            console.log('queryRadius "generic pointer": ', queryRadius);
            SimbadPointer.query(radec[0], radec[1], queryRadius, view.aladin);
        }
        // planetary body case
        else {
            // TODO: replace with actual value
            const body = view.aladin.getBaseImageLayer().properties.hipsBody;
            PlanetaryFeaturesPointer.query(radec[0], radec[1], Math.min(80, view.fov / 20.0), body, view.aladin);
        }
    } else {
            console.log("The location you clicked on is out of the view.");
        }
}
)
