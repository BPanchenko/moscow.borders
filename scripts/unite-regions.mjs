import fs from "fs"
import path from "path"
import properties from "../source/geo/regions.js"
import { union } from "@turf/turf"

const SUFFIX = '.min'
const SOURCE = path.resolve(process.cwd(), `./assets/russia-regions${SUFFIX}.geojson`)
const DIST = path.resolve(process.cwd(), `./assets/russia${SUFFIX}.geojson`)

// reading

let rawdata = fs.readFileSync(SOURCE)
let geojson = JSON.parse(rawdata)
let features = geojson.features

// uniting polygons

let unionFeature
for (var i = 1, len = features.length; i < len; i++) {
	if (i == 1) {
		unionFeature = union(features[i - 1], features[i])
	} else {
		unionFeature = union(unionFeature, features[i])
	}
}

// updating with union data

unionFeature = {
	...unionFeature,
	properties: properties.ru
}
features = [unionFeature]
geojson = {
	...geojson,
	features
}

// writing

rawdata = JSON.stringify(geojson)
fs.writeFileSync(DIST, rawdata)

console.log(`File "${DIST}" was created or updated.`)
console.log('Please validate Received GeoJSON!')
