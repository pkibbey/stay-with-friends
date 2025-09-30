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
import { MapPin } from 'lucide-react'
import 'ol/ol.css'
import { HostProfileData } from '@/types'

interface MapComponentProps {
  // Single location props (backward compatibility)
  address?: string
  city?: string
  state?: string
  zip_code?: string
  country?: string
  location?: string
  className?: string
  hosts?: HostProfileData[]
}

export function MapComponent({
  address,
  city,
  state,
  zip_code,
  country,
  location,
  className = "h-100",
  hosts = [],
}: MapComponentProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const olMapRef = useRef<Map | null>(null)
  const markerLayerRef = useRef<VectorLayer<VectorSource> | null>(null)
  const popupRef = useRef<HTMLDivElement | null>(null)
  const popupOverlayRef = useRef<Overlay | null>(null)

  // Create a full address string for geocoding (single location mode)
  const fullAddress = [address, city, state, zip_code, country]
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

  const addHostsToMap = useCallback(async (hosts: HostProfileData[], map: Map) => {
    if (hosts.length === 0) return

    // Remove existing markers
    if (markerLayerRef.current) {
      map.removeLayer(markerLayerRef.current)
    }

    // Clear existing overlays (except popup)
    const existingOverlays = map.getOverlays().getArray().slice()
    existingOverlays.forEach(overlay => {
      if (overlay !== popupOverlayRef.current) {
        map.removeOverlay(overlay)
      }
    })

    const features: Feature[] = []
    const bounds: number[][] = []

    for (const host of hosts) {
      let lat: number, lon: number

      // Use coordinates if available, otherwise geocode
      if (host.latitude && host.longitude) {
        lat = host.latitude
        lon = host.longitude
      } else {
        // Geocode the host address
        try {
          const locationString = [host.address, host.city, host.state, host.zip_code, host.country]
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
            continue // Skip this host if geocoding fails
          }
        } catch (error) {
          console.warn(`Geocoding failed for host ${host.id}:`, error)
          continue
        }
      }

      const coordinates = fromLonLat([lon, lat])
      bounds.push([lon, lat])

      // Create marker element
      const markerElement = document.createElement('div')
      markerElement.className = 'map-pin-marker'
      
      // Create compact host info card
      const hostName = host.name && host.name?.length > 20 ? host.name.substring(0, 17) + '...' : (host.name || 'Unnamed Host')
      const guestInfo = host.max_guests ? `${host.max_guests} guests` : ''
      const locationInfo = host.city ? (host.city.length > 15 ? host.city.substring(0, 12) + '...' : host.city) : (host.state || '')
      
      markerElement.innerHTML = `
        <div class="host-pin-card">
          <div class="host-pin-name">${hostName}</div>
          <div class="host-pin-details">
            <span class="host-pin-location">${locationInfo}</span>
            ${guestInfo ? `<span class="host-pin-guests">${guestInfo}</span>` : ''}
          </div>
          <div class="host-pin-arrow"></div>
        </div>
      `

      // Add styles to the marker element
      markerElement.style.cssText = `
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        position: relative;
        cursor: pointer;
        transform: translate(-50%, -100%);
      `

      // Create overlay for the marker
      const markerOverlay = new Overlay({
        element: markerElement,
        position: coordinates,
        positioning: 'center-center',
        stopEvent: false,
      })

      map.addOverlay(markerOverlay)

      // Add click handler to the marker element
      markerElement.addEventListener('click', (event) => {
        event.stopPropagation()
        
        if (popupRef.current && popupOverlayRef.current) {
          // Update popup content
          const location = [host.city, host.state].filter(Boolean).join(', ') || 'Location not specified'
          const description = host.description 
            ? (host.description.length > 100 ? host.description.substring(0, 100) + '...' : host.description)
            : 'No description available'
          
          popupRef.current.innerHTML = `
            <div class="max-w-sm">
              <div class="mb-2">
                <h3 class="font-semibold text-sm line-clamp-2">${host.name || 'Unnamed Host'}</h3>
                <p class="text-xs text-gray-600">${location}</p>
              </div>
              <div class="flex items-center justify-between mb-2">
                <span class="text-xs text-gray-500">${host.max_guests ? `${host.max_guests} guests` : 'Guest capacity not specified'}</span>
              </div>
              <div class="text-xs text-gray-600 mb-2">
                ${description}
              </div>
              <a href="/host/${host.id}" class="text-xs text-blue-600 hover:text-blue-800">
                View Details →
              </a>
            </div>
          `
          popupOverlayRef.current.setPosition(coordinates)
          popupRef.current.style.display = 'block'
        }
      })

      // Create invisible feature for bounds calculation
      const marker = new Feature({
        geometry: new Point(coordinates),
        host: host,
      })

      features.push(marker)
    }

    // Create vector source and layer for bounds calculation only
    const vectorSource = new VectorSource({
      features: features,
    })

    const vectorLayer = new VectorLayer({
      source: vectorSource,
      style: new Style(), // Empty style - invisible layer, just for bounds
    })

    map.addLayer(vectorLayer)
    markerLayerRef.current = vectorLayer

    // Fit map to show all markers
    if (bounds.length > 0) {
      const extent = vectorSource.getExtent()
      map.getView().fit(extent, { 
        padding: [80, 80, 80, 80],
        maxZoom: 15 
      })
    }

    // Add global click listener for hiding popup
    map.on('click', (event) => {
      // Check if click was on a marker element
      const element = event.originalEvent.target as HTMLElement
      if (!element.closest('.host-pin-card') && popupRef.current) {
        popupRef.current.style.display = 'none'
      }
    })
  }, [])

  useEffect(() => {
    if (!mapRef.current || olMapRef.current) return

    // Add CSS styles for host pin cards
    const style = document.createElement('style')
    style.textContent = `
      .host-pin-card {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        background: white;
        border: 2px solid #dc2626;
        border-radius: 8px;
        padding: 8px 10px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        min-width: 140px;
        max-width: 180px;
        position: relative;
        cursor: pointer;
        transition: all 0.2s ease-in-out;
      }
      
      .host-pin-card:hover {
        transform: scale(1.05);
        box-shadow: 0 6px 16px rgba(0,0,0,0.2);
        border-color: #991b1b;
      }
      
      .host-pin-name {
        font-size: 12px;
        font-weight: 600;
        color: #1f2937;
        margin-bottom: 3px;
        line-height: 1.2;
      }
      
      .host-pin-details {
        font-size: 10px;
        color: #6b7280;
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 4px;
      }
      
      .host-pin-location {
        flex: 1;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      
      .host-pin-guests {
        background: #f3f4f6;
        padding: 2px 5px;
        border-radius: 4px;
        font-weight: 500;
        white-space: nowrap;
        font-size: 9px;
      }
      
      .host-pin-arrow {
        position: absolute;
        bottom: -6px;
        left: 50%;
        transform: translateX(-50%);
        width: 0;
        height: 0;
        border-left: 6px solid transparent;
        border-right: 6px solid transparent;
        border-top: 6px solid #dc2626;
      }
    `
    document.head.appendChild(style)

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
      if (popupRef.current) {
        try {
          // Check if the element still has a parent before attempting to remove
          if (popupRef.current.parentNode === document.body) {
            document.body.removeChild(popupRef.current)
          }
        } catch (error) {
          // Element might already be removed, ignore the error
          console.warn('Popup element already removed:', error)
        }
        popupRef.current = null
      }
      if (popupOverlayRef.current) {
        popupOverlayRef.current = null
      }
      // Remove added styles
      if (style.parentNode) {
        style.parentNode.removeChild(style)
      }
    }
  }, [])

  // Handle single location mode
  useEffect(() => {
    if (!olMapRef.current || hosts.length > 0) return

    const locationString = fullAddress || location || ''
    if (locationString) {
      geocodeLocation(locationString, olMapRef.current)
    }
  }, [fullAddress, location, geocodeLocation, hosts.length])

  // Handle multiple hosts mode
  useEffect(() => {
    if (!olMapRef.current || hosts.length === 0) return

    addHostsToMap(hosts, olMapRef.current)
  }, [hosts, addHostsToMap])

  return (
    <div className="relative pt-6">
      <div
        ref={mapRef}
        className={`w-full rounded-lg overflow-hidden ${className}`}
        style={{ minHeight: '200px' }}
      />
      {hosts.length === 0 && !fullAddress && !location && (
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