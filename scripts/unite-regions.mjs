import fs from "fs"
import path from "path"
import { union } from "@turf/turf"

const SOURCE = path.resolve('./assets/russia-with-regions.min.geojson')
const DIST = path.resolve('./assets/russia.min.geojson')

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
	properties: {
		code: 'RU',
		name: 'Российская Федерация'
	}
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
