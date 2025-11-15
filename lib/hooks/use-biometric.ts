"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"

export function useBiometric() {
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkBiometricSupport()
    loadBiometricSettings()
  }, [])

  const checkBiometricSupport = () => {
    // Check if Web Authentication API is available
    if (window.PublicKeyCredential) {
      setIsSupported(true)
    }
  }

  const loadBiometricSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setIsLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('user_settings')
        .select('biometric_enabled')
        .eq('user_id', user.id)
        .single()

      if (!error && data) {
        setIsBiometricEnabled(data.biometric_enabled || false)
      }
    } catch (error) {
      console.error('[v0] Error loading biometric settings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const authenticateBiometric = async (): Promise<boolean> => {
    // For demo purposes, simulate biometric authentication
    // In production, this would use WebAuthn API
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate successful authentication
        resolve(true)
      }, 1500)
    })
  }

  return {
    isBiometricEnabled,
    isSupported,
    isLoading,
    authenticateBiometric,
    refreshSettings: loadBiometricSettings,
  }
}
