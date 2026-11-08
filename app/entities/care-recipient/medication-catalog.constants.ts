import type { MedicationRequest } from '~/shared/api/generated/contracts'

/**
 * A suggestion for the medication name field, shaped like the create-medication request.
 * It only carries facts about the product itself; dosage, frequency, time of day and dates
 * belong to each patient's prescription and are always entered by the user.
 */
export type MedicationCatalogEntry = Required<Pick<MedicationRequest, 'medicationName' | 'route'>>

/**
 * Reference list of medications commonly used by older adults, named by active ingredient
 * (INN) and strength. It is input assistance only, not a formulary or prescribing guidance;
 * users can still type any name the prescription shows.
 */
export const MEDICATION_CATALOG: readonly MedicationCatalogEntry[] = [
  // Hypertension and heart failure
  { medicationName: 'Amlodipine 5 mg', route: 'ORAL' },
  { medicationName: 'Amlodipine 10 mg', route: 'ORAL' },
  { medicationName: 'Nifedipine 30 mg (retard)', route: 'ORAL' },
  { medicationName: 'Losartan 50 mg', route: 'ORAL' },
  { medicationName: 'Telmisartan 40 mg', route: 'ORAL' },
  { medicationName: 'Valsartan 80 mg', route: 'ORAL' },
  { medicationName: 'Irbesartan 150 mg', route: 'ORAL' },
  { medicationName: 'Perindopril 5 mg', route: 'ORAL' },
  { medicationName: 'Enalapril 5 mg', route: 'ORAL' },
  { medicationName: 'Lisinopril 10 mg', route: 'ORAL' },
  { medicationName: 'Bisoprolol 2.5 mg', route: 'ORAL' },
  { medicationName: 'Bisoprolol 5 mg', route: 'ORAL' },
  { medicationName: 'Metoprolol succinate 50 mg', route: 'ORAL' },
  { medicationName: 'Indapamide 1.5 mg', route: 'ORAL' },
  { medicationName: 'Hydrochlorothiazide 25 mg', route: 'ORAL' },
  { medicationName: 'Furosemide 40 mg', route: 'ORAL' },
  { medicationName: 'Spironolactone 25 mg', route: 'ORAL' },
  { medicationName: 'Digoxin 0.25 mg', route: 'ORAL' },
  // Angina
  { medicationName: 'Nitroglycerin 0.5 mg', route: 'ORAL' },
  { medicationName: 'Isosorbide mononitrate 60 mg', route: 'ORAL' },
  { medicationName: 'Trimetazidine 35 mg', route: 'ORAL' },
  // Antiplatelets and anticoagulants
  { medicationName: 'Aspirin 81 mg', route: 'ORAL' },
  { medicationName: 'Clopidogrel 75 mg', route: 'ORAL' },
  { medicationName: 'Warfarin 2 mg', route: 'ORAL' },
  { medicationName: 'Rivaroxaban 15 mg', route: 'ORAL' },
  { medicationName: 'Apixaban 5 mg', route: 'ORAL' },
  { medicationName: 'Dabigatran 110 mg', route: 'ORAL' },
  // Lipids
  { medicationName: 'Atorvastatin 10 mg', route: 'ORAL' },
  { medicationName: 'Atorvastatin 20 mg', route: 'ORAL' },
  { medicationName: 'Rosuvastatin 10 mg', route: 'ORAL' },
  { medicationName: 'Simvastatin 20 mg', route: 'ORAL' },
  { medicationName: 'Fenofibrate 160 mg', route: 'ORAL' },
  // Diabetes
  { medicationName: 'Metformin 500 mg', route: 'ORAL' },
  { medicationName: 'Metformin 850 mg', route: 'ORAL' },
  { medicationName: 'Metformin XR 750 mg', route: 'ORAL' },
  { medicationName: 'Gliclazide MR 30 mg', route: 'ORAL' },
  { medicationName: 'Glimepiride 2 mg', route: 'ORAL' },
  { medicationName: 'Sitagliptin 100 mg', route: 'ORAL' },
  { medicationName: 'Vildagliptin 50 mg', route: 'ORAL' },
  { medicationName: 'Linagliptin 5 mg', route: 'ORAL' },
  { medicationName: 'Dapagliflozin 10 mg', route: 'ORAL' },
  { medicationName: 'Empagliflozin 10 mg', route: 'ORAL' },
  { medicationName: 'Acarbose 50 mg', route: 'ORAL' },
  { medicationName: 'Insulin glargine 100 IU/ml', route: 'INJECTION' },
  { medicationName: 'Insulin human 30/70 100 IU/ml', route: 'INJECTION' },
  // Neurology and cognition
  { medicationName: 'Donepezil 5 mg', route: 'ORAL' },
  { medicationName: 'Memantine 10 mg', route: 'ORAL' },
  { medicationName: 'Levodopa/Carbidopa 250/25 mg', route: 'ORAL' },
  { medicationName: 'Levodopa/Benserazide 200/50 mg', route: 'ORAL' },
  { medicationName: 'Piracetam 800 mg', route: 'ORAL' },
  { medicationName: 'Gabapentin 300 mg', route: 'ORAL' },
  { medicationName: 'Pregabalin 75 mg', route: 'ORAL' },
  // Mood and sleep
  { medicationName: 'Sertraline 50 mg', route: 'ORAL' },
  { medicationName: 'Escitalopram 10 mg', route: 'ORAL' },
  { medicationName: 'Mirtazapine 15 mg', route: 'ORAL' },
  { medicationName: 'Quetiapine 25 mg', route: 'ORAL' },
  // Digestive
  { medicationName: 'Omeprazole 20 mg', route: 'ORAL' },
  { medicationName: 'Esomeprazole 40 mg', route: 'ORAL' },
  { medicationName: 'Pantoprazole 40 mg', route: 'ORAL' },
  { medicationName: 'Domperidone 10 mg', route: 'ORAL' },
  { medicationName: 'Lactulose 10 g/15 ml', route: 'ORAL' },
  { medicationName: 'Macrogol 4000 10 g', route: 'ORAL' },
  // Pain and joints
  { medicationName: 'Paracetamol 500 mg', route: 'ORAL' },
  { medicationName: 'Celecoxib 200 mg', route: 'ORAL' },
  { medicationName: 'Meloxicam 7.5 mg', route: 'ORAL' },
  { medicationName: 'Glucosamine 1500 mg', route: 'ORAL' },
  { medicationName: 'Diclofenac gel 1%', route: 'TOPICAL' },
  // Bone health and supplements
  { medicationName: 'Calcium carbonate 1250 mg + Vitamin D3', route: 'ORAL' },
  { medicationName: 'Vitamin D3 1000 IU', route: 'ORAL' },
  { medicationName: 'Alendronate 70 mg', route: 'ORAL' },
  { medicationName: 'Vitamin B1 + B6 + B12', route: 'ORAL' },
  { medicationName: 'Potassium chloride 600 mg', route: 'ORAL' },
  // Gout
  { medicationName: 'Allopurinol 300 mg', route: 'ORAL' },
  { medicationName: 'Colchicine 1 mg', route: 'ORAL' },
  // Prostate and urinary
  { medicationName: 'Tamsulosin 0.4 mg', route: 'ORAL' },
  { medicationName: 'Alfuzosin 10 mg', route: 'ORAL' },
  { medicationName: 'Finasteride 5 mg', route: 'ORAL' },
  // Respiratory
  { medicationName: 'Salbutamol 100 mcg', route: 'INHALATION' },
  { medicationName: 'Budesonide/Formoterol 160/4.5 mcg', route: 'INHALATION' },
  { medicationName: 'Tiotropium 18 mcg', route: 'INHALATION' },
  { medicationName: 'Montelukast 10 mg', route: 'ORAL' },
  // Thyroid
  { medicationName: 'Levothyroxine 50 mcg', route: 'ORAL' },
  { medicationName: 'Levothyroxine 100 mcg', route: 'ORAL' },
  // Eye drops (no dedicated route in the contract)
  { medicationName: 'Timolol 0.5% eye drops', route: 'OTHER' },
  { medicationName: 'Latanoprost 0.005% eye drops', route: 'OTHER' }
]
