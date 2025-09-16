"use client"

import { useEffect, useRef, useCallback } from 'react'
import { Map, View } from 'ol'
import TileLayer from 'ol/layer/Tile'
import OSM from 'ol/source/OSM'
import { fromLonLat } from 'ol/proj'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import { Feature } from 'ol'
import { Point } from 'ol/geom'
import { Style, Icon } from 'ol/style'
import Overlay from 'ol/Overlay'
import 'ol/ol.css'

interface MapComponentProps {
  address?: string
  city?: string
  state?: string
  zipCode?: string
  country?: string
  location?: string
  className?: string
}

export function MapComponent({
  address,
  city,
  state,
  zipCode,
  country,
  location,
  className = "h-64"
}: MapComponentProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const olMapRef = useRef<Map | null>(null)
  const markerLayerRef = useRef<VectorLayer<VectorSource> | null>(null)
  const popupRef = useRef<HTMLDivElement | null>(null)

  // Create a full address string for geocoding
  const fullAddress = [address, city, state, zipCode, country]
    .filter(Boolean)
    .join(', ')

  const geocodeLocation = useCallback(async (locationString: string, map: Map) => {
    try {
      // Use Nominatim API for geocoding (free, no API key needed)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationString)}&limit=1`
      )
      const data = await response.json()

      if (data && data.length > 0) {
        const { lat, lon } = data[0]
        const latNum = parseFloat(lat)
        const lonNum = parseFloat(lon)

        // Convert to OpenLayers projection and center map
        const coordinates = fromLonLat([lonNum, latNum])
        map.getView().setCenter(coordinates)
        map.getView().setZoom(15)

        // Remove existing markers
        if (markerLayerRef.current) {
          map.removeLayer(markerLayerRef.current)
        }

        // Create marker feature
        const marker = new Feature({
          geometry: new Point(coordinates),
        })

        // Style the marker
        const markerStyle = new Style({
          image: new Icon({
            src: 'data:image/svg+xml;base64,' + btoa(`
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#dc2626"/>
              </svg>
            `),
            scale: 1,
            anchor: [0.5, 1],
          }),
        })

        marker.setStyle(markerStyle)

        // Create vector source and layer
        const vectorSource = new VectorSource({
          features: [marker],
        })

        const vectorLayer = new VectorLayer({
          source: vectorSource,
        })

        map.addLayer(vectorLayer)
        markerLayerRef.current = vectorLayer

        // Add popup
        if (popupRef.current) {
          const popup = new Overlay({
            element: popupRef.current,
            positioning: 'bottom-center',
            stopEvent: false,
            offset: [0, -10],
          })
          map.addOverlay(popup)
          popup.setPosition(coordinates)
          popupRef.current.innerHTML = `<b>${locationString}</b>`
          popupRef.current.style.display = 'block'
        }
      }
    } catch (error) {
      console.warn('Geocoding failed:', error)
      // Fallback: just center on a reasonable default
      const defaultCoords = fromLonLat([-74.0060, 40.7128]) // NYC
      map.getView().setCenter(defaultCoords)
      map.getView().setZoom(13)
    }
  }, [])

  useEffect(() => {
    if (!mapRef.current || olMapRef.current) return

    // Create popup element
    const popupElement = document.createElement('div')
    popupElement.className = 'ol-popup bg-white border border-gray-300 rounded-lg shadow-lg p-2 text-sm font-medium max-w-xs'
    popupElement.style.display = 'none'
    document.body.appendChild(popupElement)
    popupRef.current = popupElement

    // Initialize OpenLayers map
    const map = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
      ],
      view: new View({
        center: fromLonLat([-74.0060, 40.7128]), // Default to NYC
        zoom: 13,
      }),
    })

    olMapRef.current = map

    // If we have location data, try to geocode it
    if (fullAddress || location) {
      geocodeLocation(fullAddress || location || '', map)
    }

    return () => {
      if (olMapRef.current) {
        olMapRef.current.dispose()
        olMapRef.current = null
      }
      if (popupRef.current && popupRef.current.parentNode) {
        try {
          document.body.removeChild(popupRef.current)
        } catch (error) {
          // Element might already be removed, ignore the error
          console.warn('Popup element already removed:', error)
        }
        popupRef.current = null
      }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Update map when location changes
  useEffect(() => {
    if (!olMapRef.current) return

    const locationString = fullAddress || location || ''
    if (locationString) {
      geocodeLocation(locationString, olMapRef.current)
    }
  }, [fullAddress, location, geocodeLocation])

  return (
    <div className="relative">
      <div
        ref={mapRef}
        className={`w-full rounded-lg overflow-hidden ${className}`}
        style={{ minHeight: '200px' }}
      />
    </div>
  )
}