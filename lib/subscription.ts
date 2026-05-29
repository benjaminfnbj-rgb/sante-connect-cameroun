// Définition des droits par forfait
export const PLAN_FEATURES = {
  free: {
    price: 0,
    label: 'Essai gratuit',
    canAccessDirectory: true,       // Annuaire médecins
    canAccessPharmacy: true,        // Pharmacies de garde
    canAccessHospitals: true,       // Carte hôpitaux
    canAccessAI: true,              // Assistant IA
    canAccessAppointments: true,    // Rendez-vous
    canAccessCondomsKit: false,
    canAccessPadsKit: false,
    canAccessInsurance: false,
    canAccessVaccineCalendar: false,
  },
  basic: {
    price: 1000,
    label: 'Forfait Basique',
    canAccessDirectory: true,
    canAccessPharmacy: true,
    canAccessHospitals: true,
    canAccessAI: true,
    canAccessAppointments: true,
    canAccessCondomsKit: true,      // ✅ Préservatifs
    canAccessPadsKit: false,
    canAccessInsurance: false,
    canAccessVaccineCalendar: false,
  },
  intermediate: {
    price: 1500,
    label: 'Forfait Intermédiaire',
    canAccessDirectory: true,
    canAccessPharmacy: true,
    canAccessHospitals: true,
    canAccessAI: true,
    canAccessAppointments: true,
    canAccessCondomsKit: true,      // ✅ Préservatifs
    canAccessPadsKit: true,         // ✅ Serviettes hygiéniques
    canAccessInsurance: false,
    canAccessVaccineCalendar: false,
  },
  max: {
    price: 2000,
    label: 'Forfait Max',
    canAccessDirectory: true,
    canAccessPharmacy: true,
    canAccessHospitals: true,
    canAccessAI: true,
    canAccessAppointments: true,
    canAccessCondomsKit: true,      // ✅ Préservatifs
    canAccessPadsKit: true,         // ✅ Serviettes hygiéniques
    canAccessInsurance: true,       // ✅ Espace Assurances
    canAccessVaccineCalendar: false,
  },
  family: {
    price: 2500,
    label: 'Forfait Famille / Maternité',
    canAccessDirectory: true,
    canAccessPharmacy: true,
    canAccessHospitals: true,
    canAccessAI: true,
    canAccessAppointments: true,
    canAccessCondomsKit: true,      // ✅ Préservatifs
    canAccessPadsKit: true,         // ✅ Serviettes hygiéniques
    canAccessInsurance: true,       // ✅ Espace Assurances
    canAccessVaccineCalendar: true, // ✅ Calendrier vaccinal intelligent
  },
}

export type PlanId = keyof typeof PLAN_FEATURES

export function getPlanFeatures(plan: string | null) {
  if (!plan || !(plan in PLAN_FEATURES)) return PLAN_FEATURES.free
  return PLAN_FEATURES[plan as PlanId]
}

export function canAccess(plan: string | null, feature: keyof typeof PLAN_FEATURES.free): boolean {
  return getPlanFeatures(plan)[feature] as boolean
}

// Vaccins obligatoires Cameroun (Programme Élargi de Vaccination - PEV)
export const CAMEROON_VACCINES = [
  { name: 'BCG', label: 'BCG (Tuberculose)', daysFromBirth: 0, description: 'À la naissance' },
  { name: 'VPO0', label: 'VPO0 (Polio oral)', daysFromBirth: 0, description: 'À la naissance' },
  { name: 'DTC-HepB-Hib1', label: 'Pentavalent 1 (DTC+HepB+Hib)', daysFromBirth: 42, description: '6 semaines' },
  { name: 'VPO1', label: 'VPO1 (Polio)', daysFromBirth: 42, description: '6 semaines' },
  { name: 'PCV13_1', label: 'Pneumocoque (PCV13) 1', daysFromBirth: 42, description: '6 semaines' },
  { name: 'DTC-HepB-Hib2', label: 'Pentavalent 2', daysFromBirth: 70, description: '10 semaines' },
  { name: 'VPO2', label: 'VPO2 (Polio)', daysFromBirth: 70, description: '10 semaines' },
  { name: 'PCV13_2', label: 'Pneumocoque (PCV13) 2', daysFromBirth: 70, description: '10 semaines' },
  { name: 'DTC-HepB-Hib3', label: 'Pentavalent 3', daysFromBirth: 98, description: '14 semaines' },
  { name: 'VPO3', label: 'VPO3 (Polio)', daysFromBirth: 98, description: '14 semaines' },
  { name: 'PCV13_3', label: 'Pneumocoque (PCV13) 3', daysFromBirth: 98, description: '14 semaines' },
  { name: 'VPI', label: 'VPI (Polio injectable)', daysFromBirth: 98, description: '14 semaines' },
  { name: 'RR1', label: 'Rougeole-Rubéole 1', daysFromBirth: 270, description: '9 mois' },
  { name: 'YF', label: 'Fièvre Jaune', daysFromBirth: 270, description: '9 mois' },
  { name: 'ROR', label: 'ROR (Rougeole-Oreillons-Rubéole)', daysFromBirth: 365, description: '12 mois' },
  { name: 'MenA', label: 'Méningite A (MenAfriVac)', daysFromBirth: 365, description: '12-23 mois' },
]
