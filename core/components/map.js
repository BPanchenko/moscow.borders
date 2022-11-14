import { geoAlbers, geoMercator, geoPath, select } from "d3"

import EventEmmiter from "protosite-core/lib/event-emmiter.js"
import findKey from "lodash/findKey.js"
import isEmpty from "lodash/isEmpty.js"

/* CSS Class Names
 ========================================================================== */

const CLS = Object.freeze({
	container: 'c-map',
	svg: 'c-map__plot'
})

/* Projections Adaptor
 ========================================================================== */

const PROJECTIONIS = Object.freeze({
	albers: {
		default: true,
		init: () => (
			geoAlbers()
				.rotate([-105, 0])
				.center([-10, 65])
				.parallels([52, 64])
		),
		setup: (projection, w, h) => (
			projection
				.scale(610)
				.translate([w/2, h/2])
		)
	},
	mercator: {
		init: () => (
			geoMercator()
				.rotate([-11, 0])
				.center([90, 70])
		),
		setup: (projection, w, h) => (
			projection
				.scale(w / (1.15 * Math.PI))
				.translate([w/2, h/2])
		)
	}
})

/* GeoJSON Data Container
 ========================================================================== */

class DataProvider extends EventEmmiter {
	#data
	#url

	constructor({ url }) {
		super()
		this.url = url
	}

	fetch() {
		fetch(this.#url)
			.then(res => res.json())
			.then(json => {
				this.#data = Object.freeze(json)
				this.trigger('sync', {
					data: this.features
				})
			})
			.catch(error => console.error(error))
	}

	isEmpty() {
		return isEmpty(this.#data)
	}

	get features() {
		return this.isEmpty() ? [] : this.#data.features
	}

	set url(value) {
		const previos = this.#url
		this.#url = new URL(value, window.location.origin)
		this.trigger('change:url', {
			target: this,
			value: this.#url,
			previos
		})
	}
}


/* Custom Element
 ========================================================================== */

class MapComponentElement extends HTMLElement {
	#data
	#path
	#projection
	#resizeObserver
	#svg
	#height
	#width

	constructor() {
		super()
		this.projection.init()
		this.#data = new DataProvider({ ...this.dataset })
		this.#data.on('sync', () => this.update())
		this.#resizeObserver = new ResizeObserver(entries => this.update())
	}

	attributeChangedCallback(name, previos, value) {
		switch (name) {
			case 'data-projection':
				this.projection.init()
				this.update()
				break
			case 'data-url':
				this.#data.url = value
				this.#data.fetch()
				break
		}
	}

	connectedCallback() {
		this.classList.add(CLS.container)
		
		this.#svg = select(this).append('svg').attr('class', CLS.svg)
		this.#resizeObserver.observe(this)

		this.update()
	}

	update() {
		this.#width = this.offsetWidth
		this.#height = this.offsetHeight
		this.#svg.attr('width', this.#width).attr('height', this.#height)

		this.projection.setup()

		this.#svg.selectAll('path')
			.remove()
		
		this.#svg.selectAll('path')
			.data(this.#data.features)
			.enter()
			.append('path')
			.attr('d', this.#path)
	}

	get projection() {
		let name = this.dataset.projection
		if (!PROJECTIONIS.hasOwnProperty(name)) {
			name = findKey(PROJECTIONIS, p => p.default)
			this.dataset.projection = name
		}
		let { init, setup } = PROJECTIONIS[name]
		return {
			name,
			instance: this.#projection,
			init: () => {
				this.#projection = init()
				this.#path = geoPath().projection(this.#projection)
			},
			setup: () => {
				setup(
					this.#projection,
					this.#width,
					this.#height
				)
			}
		}
	}

	static get observedAttributes() {
		return ['data-projection', 'data-url']
	}
}

customElements.define('c-map', MapComponentElement)


export {
	MapComponentElement
}
