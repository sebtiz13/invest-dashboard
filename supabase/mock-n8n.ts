import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

serve(async (req) => {
  try {
    const { record } = await req.json()
    const leadId = record.id

    await new Promise((resolve) => setTimeout(resolve, 5000))

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const dummyAnalysis = `# Analyse Patrimoniale - ${record.nom}

Bonjour ${record.nom}, voici notre analyse personnalisée de votre situation financière :

## 📊 **Situation Actuelle**
- **Âge** : ${record.age} ans
- **Revenus mensuels** : ${record.revenus_mensuels} €
- **Épargne liquide** : ${record.epargne_liquide} €
- **Patrimoine immobilier** : ${record.patrimoine_immobilier} €

## 💡 **Recommandations**
- **Diversification** : Votre épargne liquide représente un bon coussin de sécurité
- **Investissement** : Envisagez de diversifier votre patrimoine au-delà de l'immobilier
- **Prévoyance** : Pensez à souscrire une assurance adaptée à votre niveau de revenus

## 🎯 **Prochaines Étapes**
- Prendre rendez-vous avec un conseiller pour affiner cette analyse
- Explorer des options d'investissement à long terme
- Évaluer votre tolerance au risque

Merci d'avoir utilisé notre service d'évaluation patrimoniale !
`

    await supabase
      .from("leads_patrimoine")
      .update({
        statut: "analyse_terminee",
        analyse_ia: dummyAnalysis,
      })
      .eq("id", leadId)

    return new Response(null, { status: 200 })
  } catch (error) {
    console.error("Error in mock-ia-analysis:", error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
})
