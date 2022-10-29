import { geoMercator, geoPath, select } from "d3"

import EventEmmiter from "protosite-core/lib/event-emmiter.js"
import isEmpty from "lodash/isEmpty.js"

/* CSS Class Names
 ========================================================================== */

const CLS = Object.freeze({
	container: 'o-map',
	svg: 'o-map__plot'
})

/* GeoJSON Data Container
 ========================================================================== */

class DataProvider extends EventEmmiter {
	#data = {}
	#url

	constructor({ url }) {
		super()
		this.#url = new URL(url, window.location.origin)
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
	}

	isEmpty() {
		return isEmpty(this.#data)
	}

	get features() {
		return this.isEmpty() ? [] : this.#data.features
	}
}


/* Custom Element
 ========================================================================== */

class MapObjectElement extends HTMLElement {
	#data
	#path
	#projection
	#resizeObserver
	#svg
	#height
	#width

	constructor() {
		super()

		this.#data = new DataProvider({ ...this.dataset })
		this.#data.on('sync', () => this.update())
		this.#data.fetch()

		this.#projection = geoMercator()
		this.#path = geoPath().projection(this.#projection)

		this.#resizeObserver = new ResizeObserver(entries => this.update())
	}

	connectedCallback() {
		this.classList.add(CLS.container)
		
		this.#svg = select(this).append('svg').attr('class', CLS.svg)
		this.#resizeObserver.observe(this)

		this.update()
	}

	update() {
		this.#height = this.offsetHeight
		this.#width = this.offsetWidth
		this.#svg.attr('width', this.#width).attr('height', this.#height)

		this.#svg.selectAll('path')
			.data(this.#data.features)
			.enter().append('path')
			.attr('d', this.#path)
	}
}

customElements.define('o-map', MapObjectElement)


export {
	MapObjectElement
}
