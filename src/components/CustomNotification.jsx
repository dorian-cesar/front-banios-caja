// components/CustomNotification.js
"use client"

import { useState, useEffect } from "react"
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react"

export function CustomNotification(props) {
    const {
        type = "info",
        title,
        message,
        duration = 5000,
        onClose,
        show = true,
    } = props

    const [isVisible, setIsVisible] = useState(show)

    useEffect(() => {
        setIsVisible(show)
    }, [show])

    useEffect(() => {
        if (isVisible && duration > 0) {
            const timer = setTimeout(() => {
                handleClose()
            }, duration)
            return () => clearTimeout(timer)
        }
    }, [isVisible, duration])

    const handleClose = () => {
        setIsVisible(false)
        if (onClose) onClose()
    }

    if (!isVisible) return null

    const getIcon = () => {
        switch (type) {
            case "success":
                return <CheckCircle className="h-5 w-5 text-green-500" />
            case "error":
                return <AlertCircle className="h-5 w-5 text-red-500" />
            case "warning":
                return <AlertTriangle className="h-5 w-5 text-yellow-500" />
            case "info":
            default:
                return <Info className="h-5 w-5 text-blue-500" />
        }
    }

    const getStyles = () => {
        switch (type) {
            case "success":
                return "bg-green-50 border-green-200 text-green-800"
            case "error":
                return "bg-red-50 border-red-200 text-red-800"
            case "warning":
                return "bg-yellow-50 border-yellow-200 text-yellow-800"
            case "info":
            default:
                return "bg-blue-50 border-blue-200 text-blue-800"
        }
    }

    return (
        <div
            className={`fixed top-4 right-4 z-50 max-w-sm w-full transform transition-all duration-300 ${isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
                }`}
        >
            <div className={`rounded-lg border p-4 shadow-lg ${getStyles()}`}>
                <div className="flex items-start gap-3">
                    {getIcon()}
                    <div className="flex-1 min-w-0">
                        {title && <h4 className="font-medium text-sm mb-1">{title}</h4>}
                        <p className="text-sm">{message}</p>
                    </div>
                    <button
                        onClick={handleClose}
                        className="flex-shrink-0 p-1 rounded-md hover:bg-black/5 transition-colors"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    )
}