    // Copyright 2013 - UDS/CNRS
// The Aladin Lite program is distributed under the terms
// of the GNU General Public License version 3.
//
// This file is part of Aladin Lite.
//
//    Aladin Lite is free software: you can redistribute it and/or modify
//    it under the terms of the GNU General Public License as published by
//    the Free Software Foundation, version 3 of the License.
//
//    Aladin Lite is distributed in the hope that it will be useful,
//    but WITHOUT ANY WARRANTY; without even the implied warranty of
//    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//    GNU General Public License for more details.
//
//    The GNU General Public License is available in COPYING file
//    along with Aladin Lite.
//




/******************************************************************************
 * Aladin Lite project
 * 
 * File Datalink
 * 
 * Author: Matthieu Baumann[CDS]
 * 
 *****************************************************************************/

import { VOTable } from "./VOTable.js";
import { Utils } from './../Utils';

export let Datalink = (function() {

    function Datalink() {};

    Datalink.handleActions = function(url, aladinInstance) {
        VOTable.parse(
            url,
            (fields, rows) => {
                // Get the fields and the rows
                let measures = [];

                rows.forEach(row => {        
                    let data = {};

                    for (const [_, field] of Object.entries(fields)) {
                        var key = field.name;
                        data[key] = row[field.idx];
                    }

                    measures.push({data: data})
                })

                let datalinkTable = {
                    'name': 'Datalink:' + url,
                    'color': 'purple',
                    'rows': measures,
                    'fields': fields,
                    'fieldsClickedActions': {
                        'access_url': (row) => {
                            let url = row['access_url'];
                            let contentType = row['content_type'];
                            let contentQualifier = row['content_qualifier'];

                            let processImageFitsClick = () => {
                                var successCallback = ((ra, dec, fov, _) => {
                                    aladinInstance.gotoRaDec(ra, dec);
                                    aladinInstance.setFoV(fov);
                                });
                
                                let image = aladinInstance.createImageFITS(url, url, {}, successCallback);
                                aladinInstance.setOverlayImageLayer(image, Utils.uuidv4())
                            };

                            switch (contentType) {
                                case 'application/hips':
                                    // Clic on a HiPS
                                    let survey = aladinInstance.newImageSurvey(url);
                                    aladinInstance.setOverlayImageLayer(survey, Utils.uuidv4())
                                    break;
                                // Any generic FITS file
                                case 'application/fits':
                                    if (contentQualifier === "cube") {
                                        // fits cube
                                        console.warn("Cube not handled, only first slice downloaded")
                                    }

                                    processImageFitsClick();
                                    break;
                                case 'image/fits':
                                    if (contentQualifier === "cube") {
                                        // fits cube
                                        console.warn("Cube not handled, only first slice downloaded")
                                    }

                                    processImageFitsClick();
                                    break;
                                default:
                                    // When all has been done, download what's under the link
                                    Utils.download(url);
                                    break;
                            }
                        }
                    }
                }

                aladinInstance.measurementTable.showMeasurement([datalinkTable], { save: true });
            }
        )
    };

    return Datalink;
})();
