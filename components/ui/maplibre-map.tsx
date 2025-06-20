"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import type { Coordinates, User, Experience } from "@/lib/types"

interface MapLibreMapProps {
    user1?: User
    user2?: User
    midpoint?: Coordinates
    experiences?: Experience[]
    selectedExperience?: Experience
    className?: string
    height?: string
    showRoutes?: boolean
}

export function MapLibreMap({
    user1,
    user2,
    midpoint,
    experiences = [],
    selectedExperience,
    className = "",
    height = "400px",
    showRoutes = false
}: MapLibreMapProps) {
    const mapContainer = useRef<HTMLDivElement>(null)
    const mapRef = useRef<any>(null)
    const markersRef = useRef<any[]>([])
    const [isClient, setIsClient] = useState(false)
    const [isMapLoaded, setIsMapLoaded] = useState(false)
    const [mapError, setMapError] = useState(false)
    const resizeTimeoutRef = useRef<NodeJS.Timeout>()

    // Ensure we're on the client side
    useEffect(() => {
        setIsClient(true)
    }, [])

    // Handle map resizing
    const handleResize = useCallback(() => {
        if (mapRef.current && isMapLoaded) {
            if (resizeTimeoutRef.current) {
                clearTimeout(resizeTimeoutRef.current)
            }
            resizeTimeoutRef.current = setTimeout(() => {
                try {
                    mapRef.current.resize()
                } catch (error) {
                    console.warn("Error resizing map:", error)
                }
            }, 250)
        }
    }, [isMapLoaded])

    useEffect(() => {
        if (!isClient || !mapContainer.current) return

        const initializeMap = async () => {
            try {
                // Dynamically import MapLibre GL to avoid SSR issues
                const maplibregl = (await import("maplibre-gl")).default

                // Ensure container has proper dimensions
                if (!mapContainer.current) {
                    throw new Error("Map container not available")
                }

                const containerRect = mapContainer.current.getBoundingClientRect()
                if (containerRect.width === 0 || containerRect.height === 0) {
                    console.warn("Map container has no dimensions, waiting...")
                    setTimeout(() => initializeMap(), 500)
                    return
                }

                // Initialize map
                const map = new maplibregl.Map({
                    container: mapContainer.current,
                    style: {
                        version: 8,
                        sources: {
                            'osm-tiles': {
                                type: 'raster',
                                tiles: [
                                    'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
                                    'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
                                    'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png'
                                ],
                                tileSize: 256,
                                attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            }
                        },
                        layers: [
                            {
                                id: 'osm-tiles',
                                type: 'raster',
                                source: 'osm-tiles',
                                minzoom: 0,
                                maxzoom: 19
                            }
                        ]
                    },
                    center: [-74.006, 40.7128], // Default to NYC
                    zoom: 2,
                    attributionControl: false
                })

                // Add navigation controls
                map.addControl(new maplibregl.NavigationControl(), 'top-right')

                // Handle map load
                map.on('load', () => {
                    setIsMapLoaded(true)
                })

                // Handle errors
                map.on('error', (e) => {
                    console.error('Map error:', e)
                })

                mapRef.current = map

                // Set up resize observer
                if (window.ResizeObserver) {
                    const resizeObserver = new ResizeObserver(handleResize)
                    resizeObserver.observe(mapContainer.current)

                    return () => {
                        resizeObserver.disconnect()
                    }
                }
            } catch (error) {
                console.error("Failed to load MapLibre GL map:", error)
                setMapError(true)
            }
        }

        // Add a small delay to ensure the container is rendered
        const timeoutId = setTimeout(initializeMap, 100)

        return () => {
            clearTimeout(timeoutId)
            if (resizeTimeoutRef.current) {
                clearTimeout(resizeTimeoutRef.current)
            }
            if (mapRef.current) {
                try {
                    // Clear all markers
                    markersRef.current.forEach(marker => {
                        try {
                            marker.remove()
                        } catch (error) {
                            console.warn("Error removing marker:", error)
                        }
                    })
                    markersRef.current = []

                    mapRef.current.remove()
                    mapRef.current = null
                } catch (error) {
                    console.warn("Error removing map:", error)
                }
            }
        }
    }, [isClient, handleResize])

    useEffect(() => {
        if (!mapRef.current || !isMapLoaded || mapError) return

        const updateMarkers = async () => {
            try {
                const maplibregl = (await import("maplibre-gl")).default

                // Clear existing markers
                markersRef.current.forEach(marker => {
                    try {
                        marker.remove()
                    } catch (error) {
                        console.warn("Error removing marker:", error)
                    }
                })
                markersRef.current = []

                // Clean up existing routes
                if (mapRef.current.getLayer('routes')) {
                    mapRef.current.removeLayer('routes')
                }
                if (mapRef.current.getSource('routes')) {
                    mapRef.current.removeSource('routes')
                }

                const bounds = new maplibregl.LngLatBounds()
                let hasMarkers = false

                // Create custom marker element
                const createCustomMarker = (color: string, scale: number = 1, emoji: string = '👤', isHighlighted: boolean = false) => {
                    const size = 30 * scale

                    const el = document.createElement('div')
                    el.className = 'custom-maplibre-marker'
                    el.style.cssText = `
                        width: ${size}px;
                        height: ${size}px;
                        background-color: ${color};
                        border-radius: 50%;
                        border: ${isHighlighted ? '4px solid #FFD93D' : '3px solid white'};
                        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: ${Math.max(12, size * 0.4)}px;
                        color: white;
                        font-weight: bold;
                        cursor: pointer;
                        position: relative;
                        z-index: 1000;
                        transition: all 0.2s ease;
                        ${isHighlighted ? 'transform: scale(1.2);' : ''}
                    `
                    el.textContent = emoji

                    // Add hover effect
                    el.addEventListener('mouseenter', () => {
                        el.style.transform = isHighlighted ? 'scale(1.3)' : 'scale(1.1)'
                    })
                    el.addEventListener('mouseleave', () => {
                        el.style.transform = isHighlighted ? 'scale(1.2)' : 'scale(1)'
                    })

                    return el
                }

                // Add user 1 marker
                if (user1?.coordinates) {
                    const markerElement = createCustomMarker('#FF6B6B', 1.0, '👤', false)

                    const marker1 = new maplibregl.Marker(markerElement)
                        .setLngLat([user1.coordinates.lng, user1.coordinates.lat])
                        .setPopup(
                            new maplibregl.Popup({ offset: 25 })
                                .setHTML(`
                                    <div style="padding: 12px; font-family: Inter, sans-serif; min-width: 150px;">
                                        <strong style="color: #FF6B6B; font-size: 16px;">${user1.name}</strong><br/>
                                        <small style="color: #666; font-size: 12px;">${user1.address}</small>
                                    </div>
                                `)
                        )
                        .addTo(mapRef.current)

                    markersRef.current.push(marker1)
                    bounds.extend([user1.coordinates.lng, user1.coordinates.lat])
                    hasMarkers = true
                }

                // Add user 2 marker
                if (user2?.coordinates) {
                    const markerElement = createCustomMarker('#4ECDC4', 1.0, '👤', false)

                    const marker2 = new maplibregl.Marker(markerElement)
                        .setLngLat([user2.coordinates.lng, user2.coordinates.lat])
                        .setPopup(
                            new maplibregl.Popup({ offset: 25 })
                                .setHTML(`
                                    <div style="padding: 12px; font-family: Inter, sans-serif; min-width: 150px;">
                                        <strong style="color: #4ECDC4; font-size: 16px;">${user2.name}</strong><br/>
                                        <small style="color: #666; font-size: 12px;">${user2.address}</small>
                                    </div>
                                `)
                        )
                        .addTo(mapRef.current)

                    markersRef.current.push(marker2)
                    bounds.extend([user2.coordinates.lng, user2.coordinates.lat])
                    hasMarkers = true
                }

                // Add experience markers with priority numbering
                if (experiences.length > 0) {
                    experiences.forEach((experience, index) => {
                        const isHighlighted = selectedExperience?.id === experience.id
                        const markerElement = createCustomMarker(
                            isHighlighted ? '#FFD93D' : '#8B5CF6',
                            isHighlighted ? 1.4 : 1.1,
                            `${index + 1}`,
                            isHighlighted
                        )

                        const experienceMarker = new maplibregl.Marker(markerElement)
                            .setLngLat([experience.venue.coordinates.lng, experience.venue.coordinates.lat])
                            .setPopup(
                                new maplibregl.Popup({ offset: 25 })
                                    .setHTML(`
                                        <div style="padding: 15px; font-family: Inter, sans-serif; min-width: 200px;">
                                            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                                                <div style="width: 24px; height: 24px; background: ${isHighlighted ? '#FFD93D' : '#8B5CF6'}; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 12px;">
                                                    ${index + 1}
                                                </div>
                                                <strong style="color: ${isHighlighted ? '#FFD93D' : '#8B5CF6'}; font-size: 16px;">Experience ${index + 1}</strong>
                                            </div>
                                            <h4 style="color: #333; font-size: 16px; margin: 0 0 4px 0; font-weight: bold;">${experience.venue.name}</h4>
                                            <small style="color: #666; font-size: 12px; display: block; margin-bottom: 8px;">${experience.venue.address}</small>
                                            ${experience.venue.rating ? `
                                                <div style="display: flex; align-items: center; gap: 4px; margin-bottom: 8px;">
                                                    <span style="color: #fbbf24;">⭐</span>
                                                    <small style="color: #666; font-size: 12px;">${experience.venue.rating} rating</small>
                                                </div>
                                            ` : ''}
                                            <small style="color: #888; font-size: 11px;">Duration: ${experience.estimatedDuration} minutes</small>
                                        </div>
                                    `)
                            )
                            .addTo(mapRef.current)

                        markersRef.current.push(experienceMarker)
                        bounds.extend([experience.venue.coordinates.lng, experience.venue.coordinates.lat])
                        hasMarkers = true
                    })
                } else if (midpoint) {
                    // Add midpoint marker if no experiences but midpoint exists
                    const markerElement = createCustomMarker('#FFD93D', 1.3, '📍', false)

                    const midpointMarker = new maplibregl.Marker(markerElement)
                        .setLngLat([midpoint.lng, midpoint.lat])
                        .setPopup(
                            new maplibregl.Popup({ offset: 25 })
                                .setHTML(`
                                    <div style="padding: 12px; font-family: Inter, sans-serif; min-width: 150px;">
                                        <strong style="color: #FFD93D; font-size: 16px;">📍 Meeting Point</strong><br/>
                                        <small style="color: #666; font-size: 12px;">Perfect midpoint for your meetup</small><br/>
                                        <small style="color: #999; font-size: 11px;">Lat: ${midpoint.lat.toFixed(4)}, Lng: ${midpoint.lng.toFixed(4)}</small>
                                    </div>
                                `)
                        )
                        .addTo(mapRef.current)

                    markersRef.current.push(midpointMarker)
                    bounds.extend([midpoint.lng, midpoint.lat])
                    hasMarkers = true
                }

                // Add route lines if enabled and we have experiences
                if (showRoutes && experiences.length > 0 && user1?.coordinates && user2?.coordinates) {
                    try {
                        // Get the first experience as the main meeting point
                        const firstExperience = experiences[0]

                        // Add simple straight-line routes from users to first experience
                        if (firstExperience?.venue?.coordinates) {
                            // Add route lines to the map
                            const routeData = {
                                type: 'FeatureCollection',
                                features: [
                                    // User 1 to first experience
                                    {
                                        type: 'Feature',
                                        properties: {
                                            color: '#FF6B6B',
                                            width: 3,
                                            user: user1.name
                                        },
                                        geometry: {
                                            type: 'LineString',
                                            coordinates: [
                                                [user1.coordinates.lng, user1.coordinates.lat],
                                                [firstExperience.venue.coordinates.lng, firstExperience.venue.coordinates.lat]
                                            ]
                                        }
                                    },
                                    // User 2 to first experience
                                    {
                                        type: 'Feature',
                                        properties: {
                                            color: '#4ECDC4',
                                            width: 3,
                                            user: user2.name
                                        },
                                        geometry: {
                                            type: 'LineString',
                                            coordinates: [
                                                [user2.coordinates.lng, user2.coordinates.lat],
                                                [firstExperience.venue.coordinates.lng, firstExperience.venue.coordinates.lat]
                                            ]
                                        }
                                    }
                                ]
                            }

                            // Add route source and layer
                            if (!mapRef.current.getSource('routes')) {
                                mapRef.current.addSource('routes', {
                                    type: 'geojson',
                                    data: routeData
                                })

                                mapRef.current.addLayer({
                                    id: 'routes',
                                    type: 'line',
                                    source: 'routes',
                                    layout: {
                                        'line-join': 'round',
                                        'line-cap': 'round'
                                    },
                                    paint: {
                                        'line-color': ['get', 'color'],
                                        'line-width': ['get', 'width'],
                                        'line-opacity': 0.8,
                                        'line-dasharray': [2, 2] // Dashed line
                                    }
                                })
                            } else {
                                // Update existing route data
                                mapRef.current.getSource('routes').setData(routeData)
                            }
                        }
                    } catch (error) {
                        console.warn("Error adding route lines:", error)
                    }
                }

                // Fit map to show all markers with proper padding
                if (hasMarkers && !bounds.isEmpty()) {
                    setTimeout(() => {
                        if (mapRef.current) {
                            try {
                                mapRef.current.fitBounds(bounds, {
                                    padding: { top: 50, bottom: 50, left: 50, right: 50 },
                                    maxZoom: selectedExperience ? 14 : 13
                                })
                            } catch (error) {
                                console.warn("Error fitting bounds:", error)
                            }
                        }
                    }, 200)
                }
            } catch (error) {
                console.error("Failed to update markers:", error)
                setMapError(true)
            }
        }

        updateMarkers()
    }, [user1, user2, midpoint, experiences, selectedExperience, showRoutes, isMapLoaded, mapError])

    // Show loading state until client-side rendering
    if (!isClient) {
        return (
            <div
                className={`rounded-2xl overflow-hidden border-2 border-gray-200 bg-gray-100 flex items-center justify-center ${className}`}
                style={{ height, minHeight: height }}
            >
                <div className="text-center">
                    <div className="w-8 h-8 border-2 border-coral border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    <p className="text-gray-600 text-sm">Loading map...</p>
                </div>
            </div>
        )
    }

    // Show error state if map failed to load
    if (mapError) {
        return (
            <div
                className={`rounded-2xl overflow-hidden border-2 border-yellow-200 bg-yellow-50 flex items-center justify-center ${className}`}
                style={{ height, minHeight: height }}
            >
                <div className="text-center p-6">
                    <div className="w-12 h-12 bg-yellow-200 rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="text-yellow-600 text-lg">⚠️</span>
                    </div>
                    <p className="text-yellow-800 font-medium mb-1">Map Service Unavailable</p>
                    <p className="text-yellow-700 text-sm">Please check your internet connection</p>
                    <button
                        onClick={() => {
                            setMapError(false)
                            setIsMapLoaded(false)
                        }}
                        className="mt-3 px-4 py-2 bg-yellow-200 text-yellow-800 rounded-lg text-sm hover:bg-yellow-300"
                    >
                        Retry
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className={`rounded-2xl overflow-hidden border-2 border-gray-200 relative ${className}`} style={{ height, minHeight: height }}>
            <div
                ref={mapContainer}
                style={{
                    height: '100%',
                    width: '100%',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    zIndex: 0
                }}
                className="maplibre-map-container"
            />
            {!isMapLoaded && (
                <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-10">
                    <div className="text-center">
                        <div className="w-8 h-8 border-2 border-coral border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                        <p className="text-gray-600 text-sm">Initializing map...</p>
                    </div>
                </div>
            )}
        </div>
    )
} 