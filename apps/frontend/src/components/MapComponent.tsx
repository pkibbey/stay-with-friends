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
import { Style, Icon, Text, Fill, Stroke } from 'ol/style'
import Overlay from 'ol/Overlay'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MapPin, Users } from 'lucide-react'
import Link from 'next/link'
import 'ol/ol.css'

interface Listing {
  id: string
  title: string
  description: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
  latitude?: number
  longitude?: number
  maxGuests: number
  bedrooms: number
  bathrooms: number
  amenities: string[]
  photos: string[]
  isActive: boolean
  user: {
    id: string
    name: string
    email: string
  }
}

interface MapComponentProps {
  // Single location props (backward compatibility)
  address?: string
  city?: string
  state?: string
  zipCode?: string
  country?: string
  location?: string
  className?: string
  // Multiple listings for search results
  listings?: Listing[]
  isLoading?: boolean
}

export function MapComponent({
  address,
  city,
  state,
  zipCode,
  country,
  location,
  className = "h-64",
  listings = [],
  isLoading = false
}: MapComponentProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const olMapRef = useRef<Map | null>(null)
  const markerLayerRef = useRef<VectorLayer<VectorSource> | null>(null)
  const popupRef = useRef<HTMLDivElement | null>(null)
  const popupOverlayRef = useRef<Overlay | null>(null)

  // Create a full address string for geocoding (single location mode)
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
      }
    } catch (error) {
      console.warn('Geocoding failed:', error)
      // Fallback: just center on a reasonable default
      const defaultCoords = fromLonLat([-74.0060, 40.7128]) // NYC
      map.getView().setCenter(defaultCoords)
      map.getView().setZoom(13)
    }
  }, [])

  const addListingsToMap = useCallback(async (listings: Listing[], map: Map) => {
    if (listings.length === 0) return

    // Remove existing markers
    if (markerLayerRef.current) {
      map.removeLayer(markerLayerRef.current)
    }

    const features: Feature[] = []
    const bounds: number[][] = []

    for (const listing of listings) {
      let lat: number, lon: number

      // Use coordinates if available, otherwise geocode
      if (listing.latitude && listing.longitude) {
        lat = listing.latitude
        lon = listing.longitude
      } else {
        // Geocode the listing address
        try {
          const locationString = [listing.address, listing.city, listing.state, listing.zipCode, listing.country]
            .filter(Boolean)
            .join(', ')
          
          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationString)}&limit=1`
          )
          const data = await response.json()

          if (data && data.length > 0) {
            lat = parseFloat(data[0].lat)
            lon = parseFloat(data[0].lon)
          } else {
            continue // Skip this listing if geocoding fails
          }
        } catch (error) {
          console.warn(`Geocoding failed for listing ${listing.id}:`, error)
          continue
        }
      }

      const coordinates = fromLonLat([lon, lat])
      bounds.push([lon, lat])

      // Create marker feature
      const marker = new Feature({
        geometry: new Point(coordinates),
        listing: listing, // Store listing data for popup
      })

      // Style the marker with price
      const markerStyle = new Style({
        image: new Icon({
          src: 'data:image/svg+xml;base64,' + btoa(`
            <svg width="40" height="48" viewBox="0 0 40 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 2C13.38 2 8 7.38 8 14c0 8.75 12 30 12 30s12-21.25 12-30c0-6.62-5.38-12-12-12z" fill="#dc2626" stroke="#fff" stroke-width="2"/>
              <circle cx="20" cy="14" r="6" fill="#fff"/>
            </svg>
          `),
          scale: 0.8,
          anchor: [0.5, 1],
        }),
        text: new Text({
          text: 'Free',
          font: 'bold 11px sans-serif',
          fill: new Fill({ color: '#fff' }),
          stroke: new Stroke({ color: '#dc2626', width: 2 }),
          offsetY: -25,
          backgroundFill: new Fill({ color: '#dc2626' }),
          padding: [2, 4, 2, 4],
        }),
      })

      marker.setStyle(markerStyle)
      features.push(marker)
    }

    // Create vector source and layer
    const vectorSource = new VectorSource({
      features: features,
    })

    const vectorLayer = new VectorLayer({
      source: vectorSource,
    })

    map.addLayer(vectorLayer)
    markerLayerRef.current = vectorLayer

    // Fit map to show all markers
    if (bounds.length > 0) {
      const extent = vectorSource.getExtent()
      map.getView().fit(extent, { 
        padding: [50, 50, 50, 50],
        maxZoom: 15 
      })
    }

    // Add click listener for popups
    map.on('click', (event) => {
      const feature = map.forEachFeatureAtPixel(event.pixel, (feature) => feature)
      
      if (feature && feature.get('listing')) {
        const listing = feature.get('listing') as Listing
        const coordinates = (feature.getGeometry() as Point).getCoordinates()
        
        if (popupRef.current && popupOverlayRef.current) {
          // Update popup content
          popupRef.current.innerHTML = `
            <div class="max-w-sm">
              <div class="mb-2">
                <h3 class="font-semibold text-sm line-clamp-2">${listing.title}</h3>
                <p class="text-xs text-gray-600">${listing.city}, ${listing.state}</p>
              </div>
              <div class="flex items-center justify-between mb-2">
                <span class="text-xs text-gray-500">${listing.maxGuests} guests</span>
              </div>
              <div class="text-xs text-gray-600 mb-2">
                Host: ${listing.user.name}
              </div>
              <a href="/listings/${listing.id}" class="text-xs text-blue-600 hover:text-blue-800">
                View Details →
              </a>
            </div>
          `
          popupOverlayRef.current.setPosition(coordinates)
          popupRef.current.style.display = 'block'
        }
      } else {
        // Hide popup if clicking elsewhere
        if (popupRef.current) {
          popupRef.current.style.display = 'none'
        }
      }
    })
  }, [])

  useEffect(() => {
    if (!mapRef.current || olMapRef.current) return

    // Create popup element
    const popupElement = document.createElement('div')
    popupElement.className = 'ol-popup bg-white border border-gray-300 rounded-lg shadow-lg p-3 text-sm max-w-xs pointer-events-auto'
    popupElement.style.display = 'none'
    document.body.appendChild(popupElement)
    popupRef.current = popupElement

    // Create popup overlay
    const popup = new Overlay({
      element: popupElement,
      positioning: 'bottom-center',
      stopEvent: false,
      offset: [0, -10],
    })
    popupOverlayRef.current = popup

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

    map.addOverlay(popup)
    olMapRef.current = map

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

  // Handle single location mode
  useEffect(() => {
    if (!olMapRef.current || listings.length > 0) return

    const locationString = fullAddress || location || ''
    if (locationString) {
      geocodeLocation(locationString, olMapRef.current)
    }
  }, [fullAddress, location, geocodeLocation, listings.length])

  // Handle multiple listings mode
  useEffect(() => {
    if (!olMapRef.current || listings.length === 0) return

    addListingsToMap(listings, olMapRef.current)
  }, [listings, addListingsToMap])

  if (isLoading) {
    return (
      <div className={`w-full rounded-lg overflow-hidden bg-gray-200 flex items-center justify-center ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Loading map...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      <div
        ref={mapRef}
        className={`w-full rounded-lg overflow-hidden ${className}`}
        style={{ minHeight: '200px' }}
      />
      {listings.length === 0 && !fullAddress && !location && (
        <div className="absolute inset-0 bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="text-center text-gray-500">
            <MapPin className="w-8 h-8 mx-auto mb-2" />
            <p className="text-sm">No locations to display</p>
          </div>
        </div>
      )}
    </div>
  )
}