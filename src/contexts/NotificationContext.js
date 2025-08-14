"use client"
import { createContext, useState, useContext } from "react"
import { CustomNotification } from "@/components/CustomNotification"

const NotificationContext = createContext()

export function NotificationProvider({ children }) {
    const [notification, setNotification] = useState(null)

    const showNotification = (data) => {
        setNotification(data)
    }

    const hideNotification = () => {
        setNotification(null)
    }

    return (
        <NotificationContext.Provider value={{ showNotification, hideNotification }}>
            {children}
            {notification && (
                <CustomNotification
                    type={notification.type}
                    title={notification.title}
                    message={notification.message}
                    duration={notification.duration}
                    onClose={hideNotification}
                    show={true}
                />
            )}
        </NotificationContext.Provider>
    )
}

export const useNotification = () => useContext(NotificationContext)