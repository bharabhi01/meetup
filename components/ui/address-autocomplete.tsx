"use client"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { MapPin, Clock, Star, Navigation2 } from "lucide-react"
import { searchAddresses, retrieveMapboxLocation, type AddressResult } from "@/lib/utils/location"

interface AddressAutocompleteProps {
    value: string
    onChange: (value: string) => void
    onSelect: (address: AddressResult) => void
    placeholder?: string
    className?: string
    disabled?: boolean
}

export function AddressAutocomplete({
    value,
    onChange,
    onSelect,
    placeholder = "Enter address or city",
    className = "",
    disabled = false
}: AddressAutocompleteProps) {
    const [suggestions, setSuggestions] = useState<AddressResult[]>([])
    const [isOpen, setIsOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [selectedIndex, setSelectedIndex] = useState(-1)
    const [sessionToken, setSessionToken] = useState<string>('')
    const searchTimeoutRef = useRef<NodeJS.Timeout>()
    const inputRef = useRef<HTMLInputElement>(null)
    const dropdownRef = useRef<HTMLDivElement>(null)

    // Generate session token on mount
    useEffect(() => {
        setSessionToken('xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            const r = Math.random() * 16 | 0
            const v = c === 'x' ? r : (r & 0x3 | 0x8)
            return v.toString(16)
        }))
    }, [])

    // Debounced search function
    useEffect(() => {
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current)
        }

        if (value.trim().length < 2) {
            setSuggestions([])
            setIsOpen(false)
            return
        }

        setIsLoading(true)
        searchTimeoutRef.current = setTimeout(async () => {
            try {
                const results = await searchAddresses(value, 8)
                setSuggestions(results)
                setIsOpen(results.length > 0)
                setSelectedIndex(-1)
            } catch (error) {
                console.error("Error searching addresses:", error)
                setSuggestions([])
                setIsOpen(false)
            } finally {
                setIsLoading(false)
            }
        }, 300) // Reduced debounce for better UX

        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current)
            }
        }
    }, [value])

    // Handle input change
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value
        onChange(newValue)
    }

    // Handle suggestion selection
    const handleSuggestionSelect = async (suggestion: AddressResult) => {
        onChange(suggestion.display_name)
        setIsOpen(false)
        setSelectedIndex(-1)
        inputRef.current?.blur()

        // Check if coordinates are already available (Nominatim results)
        if (suggestion.lat && suggestion.lng && suggestion.lat !== 0 && suggestion.lng !== 0) {
            console.log('Using coordinates from search result:', { lat: suggestion.lat, lng: suggestion.lng })
            onSelect(suggestion)
            return
        }

        // If this is a Mapbox suggestion, retrieve coordinates
        if (suggestion.mapbox_id) {
            console.log('Retrieving coordinates for Mapbox ID:', suggestion.mapbox_id)
            try {
                const coordinates = await retrieveMapboxLocation(suggestion.mapbox_id, sessionToken)
                console.log('Retrieved coordinates:', coordinates)
                if (coordinates) {
                    const enhancedSuggestion = {
                        ...suggestion,
                        lat: coordinates.lat,
                        lng: coordinates.lng
                    }
                    console.log('Enhanced suggestion with coordinates:', enhancedSuggestion)
                    onSelect(enhancedSuggestion)
                } else {
                    console.warn('No coordinates returned from Mapbox retrieve')
                    onSelect(suggestion)
                }
            } catch (error) {
                console.error("Error retrieving coordinates:", error)
                onSelect(suggestion)
            }
        } else {
            console.log('Non-Mapbox suggestion without coordinates, using as-is:', suggestion)
            onSelect(suggestion)
        }
    }

    // Handle keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!isOpen || suggestions.length === 0) return

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault()
                setSelectedIndex(prev =>
                    prev < suggestions.length - 1 ? prev + 1 : 0
                )
                break
            case 'ArrowUp':
                e.preventDefault()
                setSelectedIndex(prev =>
                    prev > 0 ? prev - 1 : suggestions.length - 1
                )
                break
            case 'Enter':
                e.preventDefault()
                if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
                    handleSuggestionSelect(suggestions[selectedIndex])
                }
                break
            case 'Escape':
                setIsOpen(false)
                setSelectedIndex(-1)
                inputRef.current?.blur()
                break
        }
    }

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node) &&
                !inputRef.current?.contains(event.target as Node)
            ) {
                setIsOpen(false)
                setSelectedIndex(-1)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Format location type for display with enhanced icons
    const formatLocationType = (type: string, poiCategory?: string[]) => {
        // POI-specific icons
        if (poiCategory && poiCategory.length > 0) {
            const category = poiCategory[0].toLowerCase()
            if (category.includes('restaurant') || category.includes('food')) return '🍽️ Restaurant'
            if (category.includes('coffee')) return '☕ Coffee Shop'
            if (category.includes('gas')) return '⛽ Gas Station'
            if (category.includes('hotel')) return '🏨 Hotel'
            if (category.includes('hospital')) return '🏥 Hospital'
            if (category.includes('school')) return '🏫 School'
            if (category.includes('shop')) return '🛍️ Shop'
            if (category.includes('bank')) return '🏦 Bank'
            return '📍 Place'
        }

        // Address type icons
        const typeMap: Record<string, string> = {
            'address': '🏠 Address',
            'poi': '📍 Place',
            'place': '🏙️ City',
            'locality': '🏘️ Area',
            'neighborhood': '🏠 Neighborhood',
            'district': '📍 District',
            'region': '🗺️ Region',
            'country': '🌍 Country',
            'postcode': '📮 Postal Code'
        }
        return typeMap[type] || '📍 Location'
    }

    // Get result icon based on maki or type
    const getResultIcon = (suggestion: AddressResult) => {
        if (suggestion.maki) {
            // Map common maki icons to emojis
            const makiMap: Record<string, string> = {
                'restaurant': '🍽️',
                'cafe': '☕',
                'fuel': '⛽',
                'lodging': '🏨',
                'hospital': '🏥',
                'school': '🏫',
                'shop': '🛍️',
                'bank': '🏦',
                'marker': '📍'
            }
            return makiMap[suggestion.maki] || '📍'
        }
        return '📍'
    }

    return (
        <div className="relative">
            <div className="relative">
                <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                    ref={inputRef}
                    value={value}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    onFocus={() => {
                        if (suggestions.length > 0) {
                            setIsOpen(true)
                        }
                    }}
                    placeholder={placeholder}
                    className={`pl-12 h-14 text-lg rounded-2xl border-gray-200 focus:border-coral focus:ring-coral ${className}`}
                    disabled={disabled}
                    autoComplete="off"
                />
                {isLoading && (
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                        <div className="w-5 h-5 border-2 border-gray-300 border-t-coral rounded-full animate-spin"></div>
                    </div>
                )}
            </div>

            {/* Enhanced Dropdown */}
            {isOpen && suggestions.length > 0 && (
                <div
                    ref={dropdownRef}
                    className="absolute z-50 w-full mt-2 bg-white border-2 border-gray-200 rounded-2xl shadow-xl max-h-80 overflow-y-auto"
                >
                    {suggestions.map((suggestion, index) => (
                        <div
                            key={`${suggestion.mapbox_id || suggestion.display_name}-${index}`}
                            onClick={() => handleSuggestionSelect(suggestion)}
                            className={`p-4 cursor-pointer transition-colors ${index === selectedIndex
                                ? 'bg-coral text-white'
                                : 'hover:bg-gray-50'
                                } ${index === 0 ? 'rounded-t-2xl' : ''} ${index === suggestions.length - 1 ? 'rounded-b-2xl' : 'border-b border-gray-100'
                                }`}
                        >
                            <div className="flex items-start gap-3">
                                <div className={`flex-shrink-0 mt-1 text-lg ${index === selectedIndex ? 'text-white' : 'text-gray-400'
                                    }`}>
                                    {getResultIcon(suggestion)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className={`font-medium text-sm leading-tight ${index === selectedIndex ? 'text-white' : 'text-gray-900'
                                        }`}>
                                        {suggestion.full_address || suggestion.display_name}
                                    </div>
                                    <div className={`text-xs mt-1 flex items-center gap-2 ${index === selectedIndex ? 'text-white/80' : 'text-gray-500'
                                        }`}>
                                        <span>{formatLocationType(suggestion.type, suggestion.poi_category)}</span>
                                        {suggestion.importance > 0.8 && (
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 ${index === selectedIndex
                                                ? 'bg-white/20 text-white'
                                                : 'bg-green-100 text-green-700'
                                                }`}>
                                                <Star className="h-3 w-3" />
                                                Popular
                                            </span>
                                        )}
                                        {suggestion.distance && (
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 ${index === selectedIndex
                                                ? 'bg-white/20 text-white'
                                                : 'bg-blue-100 text-blue-700'
                                                }`}>
                                                <Navigation2 className="h-3 w-3" />
                                                {(suggestion.distance / 1000).toFixed(1)}km
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Enhanced Footer */}
                    <div className="px-4 py-3 bg-gray-50 rounded-b-2xl border-t border-gray-100">
                        <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                            <Clock className="h-3 w-3" />
                            <span>Powered by Mapbox Search</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
} 