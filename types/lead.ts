export interface Lead {
  id: string
  nom: string
  age: number
  revenus_mensuels: number
  epargne_liquide: number
  patrimoine_immobilier: number
  statut: 'en_attente' | 'analyse_terminee'
  analyse_ia: string | null
}
