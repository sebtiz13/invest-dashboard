"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { supabase } from "@/lib/supabase"

export default function Home() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    nom: "",
    age: "",
    revenus_mensuels: "",
    epargne_liquide: "",
    patrimoine_immobilier: "",
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Insert data into leads_patrimoine table
    const { data, error } = await supabase
      .from("leads_patrimoine")
      .insert({
        nom: formData.nom,
        age: parseInt(formData.age),
        revenus_mensuels: parseFloat(formData.revenus_mensuels),
        epargne_liquide: parseFloat(formData.epargne_liquide),
        patrimoine_immobilier: parseFloat(formData.patrimoine_immobilier),
        statut: "en_attente",
        analyse_ia: null,
      })
      .select("id")
      .single()

    if (error) {
      console.error("Insert error:", error)
      setIsLoading(false)
      return
    }

    const insertedId = data.id

    // Redirect to the lead result page with UUID in URL
    router.push(`/leads/${insertedId}`)
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center p-4">
      {isLoading ? (
        // Loading state with Skeleton
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
      ) : (
        // Form state
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="text-2xl">
              Évaluation Patrimoniale
            </CardTitle>
            <CardDescription>
              Entrez vos informations financières pour recevoir des conseils
              personnalisés.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nom">Nom complet</Label>
                <Input
                  id="nom"
                  name="nom"
                  value={formData.nom}
                  onChange={handleInputChange}
                  placeholder="Jean Dupont"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="age">Âge</Label>
                <Input
                  id="age"
                  name="age"
                  type="number"
                  value={formData.age}
                  onChange={handleInputChange}
                  placeholder="35"
                  required
                  min="18"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="revenus_mensuels">Revenus mensuels (€)</Label>
                <Input
                  id="revenus_mensuels"
                  name="revenus_mensuels"
                  type="number"
                  value={formData.revenus_mensuels}
                  onChange={handleInputChange}
                  placeholder="5000"
                  required
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="epargne_liquide">Épargne liquide (€)</Label>
                <Input
                  id="epargne_liquide"
                  name="epargne_liquide"
                  type="number"
                  value={formData.epargne_liquide}
                  onChange={handleInputChange}
                  placeholder="50000"
                  required
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="patrimoine_immobilier">
                  Patrimoine immobilier (€)
                </Label>
                <Input
                  id="patrimoine_immobilier"
                  name="patrimoine_immobilier"
                  type="number"
                  value={formData.patrimoine_immobilier}
                  onChange={handleInputChange}
                  placeholder="250000"
                  required
                  min="0"
                  step="0.01"
                />
              </div>

              <Button type="submit" className="w-full">
                Obtenir mon analyse
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
