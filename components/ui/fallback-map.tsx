"use client"

import { MapPin } from "lucide-react"
import type { Coordinates, User } from "@/lib/types"

interface FallbackMapProps {
    user1?: User
    user2?: User
    midpoint?: Coordinates
    className?: string
    height?: string
}

export function FallbackMap({ user1, user2, midpoint, className = "", height = "400px" }: FallbackMapProps) {
    return (
        <div className={`rounded-2xl overflow-hidden border-2 border-gray-200 bg-gray-50 ${className}`} style={{ height }}>
            <div className="h-full flex flex-col items-center justify-center p-8">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-6">
                    <MapPin className="h-8 w-8 text-gray-500" />
                </div>

                <h3 className="text-lg font-semibold text-gray-700 mb-2">Map Preview</h3>
                <p className="text-sm text-gray-500 text-center mb-6">
                    Interactive map will appear here once locations are set
                </p>

                {/* Show location summary */}
                <div className="space-y-3 w-full max-w-sm">
                    {user1 && (
                        <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
                            <div className="w-3 h-3 bg-coral rounded-full"></div>
                            <div className="flex-1">
                                <p className="font-medium text-sm">{user1.name}</p>
                                <p className="text-xs text-gray-500 truncate">{user1.address}</p>
                            </div>
                        </div>
                    )}

                    {user2 && (
                        <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
                            <div className="w-3 h-3 bg-teal-500 rounded-full"></div>
                            <div className="flex-1">
                                <p className="font-medium text-sm">{user2.name}</p>
                                <p className="text-xs text-gray-500 truncate">{user2.address}</p>
                            </div>
                        </div>
                    )}

                    {midpoint && (
                        <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg shadow-sm">
                            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                            <div className="flex-1">
                                <p className="font-medium text-sm">Meeting Point</p>
                                <p className="text-xs text-gray-500">
                                    {midpoint.lat.toFixed(4)}, {midpoint.lng.toFixed(4)}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {!user1 && !user2 && (
                    <p className="text-xs text-gray-400 text-center">
                        Enter locations above to see them plotted here
                    </p>
                )}
            </div>
        </div>
    )
} 