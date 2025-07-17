"use client"

import { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

mapboxgl.accessToken = "pk.eyJ1Ijoia2V5b3B0dGEiLCJhIjoiY21kNWxjdHRhMDB1aTJrcHFxdHEwOWFlNiJ9.8o8EW3fzmctHWsRnQdQEnQ"

export default function RWMap() {
  const mapContainer = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const map = new mapboxgl.Map({
      container: mapContainer.current!,
      style: 'mapbox://styles/mapbox/light-v10',
      center: [107.6889, -6.9744],
      zoom: 13,
    })

    Promise.all([
      fetch('/data/rw_cipamokolan.geojson').then(res => res.json()),
      fetch('http://localhost:5000/api/density-map').then(res => res.json())
    ]).then(([geojson, densityData]) => {
      // Gabungkan jumlah penduduk ke geojson RW
      geojson.features = geojson.features.map((feature: any) => {
        const rw = feature.properties.rw
        console.log(rw)
        feature.properties.jumlah_penduduk = densityData[rw] || 0
        return feature
      })

      map.addSource('rw-cipamokolan', {
        type: 'geojson',
        data: geojson
      })

      map.addLayer({
        id: 'rw-fill',
        type: 'fill',
        source: 'rw-cipamokolan',
        paint: {
          'fill-color': [
            'interpolate',
            ['linear'],
            ['get', 'jumlah_penduduk'],
            0, 'hsl(30, 100%, 100%)',   // putih
            100, 'hsl(30, 100%, 20%)'   // coklat gelap
          ],
          'fill-opacity': 0.75,
        }
      })

      map.addLayer({
        id: 'rw-border',
        type: 'line',
        source: 'rw-cipamokolan',
        paint: {
          'line-color': '#333',
          'line-width': 1.5
        }
      })

      map.addLayer({
        id: 'rw-labels',
        type: 'symbol',
        source: 'rw-cipamokolan',
        layout: {
          'text-field': ['get', 'rw'],
          'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
          'text-size': 14,
          'text-offset': [0, 0.6],
          'text-anchor': 'top'
        },
        paint: {
          'text-color': '#000',
          'text-halo-color': '#fff',
          'text-halo-width': 1.5
        }
      })

    })

    return () => map.remove()
  }, [])

  return <div ref={mapContainer} className="w-full h-[600px]" />
}
