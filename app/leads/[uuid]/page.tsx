"use client"

import { useEffect, useState } from "react"
import { notFound, useParams } from "next/navigation"
import ReactMarkdown from 'react-markdown'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { supabase } from "@/lib/supabase"
import type { Lead } from "@/types/lead"
import type { RealtimeChannel } from "@supabase/supabase-js"

function isAnalyseEnded(lead: Lead) {
  return lead.statut === "analyse_terminee"
}

export default function LeadResultPage() {
  const params = useParams<{ uuid: string }>()
  const [lead, setLead] = useState<Lead | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let channel: RealtimeChannel | null = null
    let isMounted = true

    const setupRealtime = (uuid: string) => {
      // Create channel with unique name to avoid conflicts
      const channelName = `lead-updates-${uuid}-${Date.now()}`
      
      // Create channel
      channel = supabase.channel(channelName)
      
      // Add callback FIRST
      channel.on<Lead>(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "leads_patrimoine",
          filter: `id=eq.${uuid}`,
        },
        (payload) => {
          if (!isMounted) return

          const updatedLead = payload.new
          setLead(updatedLead)

          if (isAnalyseEnded(updatedLead)) {
            setIsLoading(false)
            // Unsubscribe from realtime to prevent memory leaks
            channel?.unsubscribe()
          }
        }
      )
      
      // Then subscribe
      channel.subscribe((status: string) => {
        console.log("Realtime subscription status:", status)
        // Only log errors for unexpected statuses (CLOSED is normal when unsubscribing)
        if (status !== "SUBSCRIBED" && status !== "CHANNEL_OPEN" && status !== "CLOSED") {
          console.error("Realtime subscription failed with status:", status)
        }
      })
    }

    const fetchLead = async () => {
      if (!isMounted) return
      
      setIsLoading(true)
      setError(null)

      // Fetch the lead data
      const { data, error } = await supabase
        .from("leads_patrimoine")
        .select("*")
        .eq("id", params.uuid)
        .single()

      if (error) {
        console.error("Fetch error:", error)
        setError("Lead introuvable. Vérifiez l'URL.")
        setIsLoading(false)
        return
      }

      if (!data) {
        notFound()
        return
      }

      const leadData = data as Lead
      setLead(leadData)

      // If analysis is already complete, stop loading immediately
      if (isAnalyseEnded(leadData)) {
        setIsLoading(false)
        return
      }

      // Setup realtime subscription for pending analysis
      // Keep isLoading as true until analysis completes
      setupRealtime(params.uuid)
    }

    fetchLead()

    // Cleanup function
    return () => {
      isMounted = false
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [params.uuid])

  if (error) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="text-2xl text-red-600">
              Erreur
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!lead) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="text-2xl">Chargement...</CardTitle>
            <CardDescription>
              Récupération de vos données.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
        </Card>
      </div>
    )
  }

  // Loading state - analysis still in progress
  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="text-2xl">Traitement de vos données</CardTitle>
            <CardDescription>
              Veuillez patienter pendant que notre IA analyse vos informations
              financières.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
        </Card>
      </div>
    )
  }

  // If analysis is complete, show results
  return (
    <div className="flex flex-1 flex-col items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl">Analyse terminée</CardTitle>
          <CardDescription>
            Votre analyse financière a été traitée.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Analyse IA :</h3>
            <div className="prose prose-slate dark:prose-invert max-w-none mt-6">
              <ReactMarkdown>{lead.analyse_ia || "Aucune analyse disponible."}</ReactMarkdown>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
