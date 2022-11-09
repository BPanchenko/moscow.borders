import properties, { defaultProps } from "../source/geo/properties.js"

import fs from "fs"
import path from "path"
import pick from "lodash/pick.js"

const EXT = '.geojson'
const SOURCE = path.resolve(process.cwd(), './source/geo')
const DIST = path.resolve(process.cwd(), './assets/russia-regions.geojson')

const geojson = {
	type: 'FeatureCollection',
	features: []
}

// collecting features

const filenames = fs.readdirSync(SOURCE)

filenames.forEach(filename => {
	if (path.extname(filename) == EXT) {
		let code = path.parse(filename).name
		let props = properties[code] ?? defaultProps

		let rawdata = fs.readFileSync(path.join(SOURCE, filename))
		let file_fc = JSON.parse(rawdata).features
		let feature = file_fc[0]

		feature.properties = {
			...props,
			...pick(feature.properties, Object.keys(props))
		}

		geojson.features.push(feature)
	}
})

// writing

let rawdata = JSON.stringify(geojson)
fs.writeFileSync(DIST, rawdata)
