import os
import pickle
from typing import Dict

import numpy as np

MODEL_PATH = os.path.join(os.path.dirname(__file__), 'artifacts', 'buildflow_rf.pkl')

_MODEL = None


def load_model(path: str = MODEL_PATH):
    global _MODEL
    if _MODEL is None:
        if not os.path.exists(path):
            raise FileNotFoundError(f"Modèle introuvable: {path}. Entraînez-le avec ml/train_model.py")
        with open(path, 'rb') as f:
            _MODEL = pickle.load(f)
    return _MODEL


def predict_from_input(progress_percent: float, budget_spent: float, weather: int, incidents: int) -> Dict[str, object]:
    model = load_model()
    x = np.array([[progress_percent, budget_spent, weather, incidents]], dtype=float)
    delay_prob = float(model.predict_proba(x)[0, 1])  # 0..1

    # Estimation heuristique de dépassement budgétaire basée sur l'écart dépense/avancement
    gap = max(0.0, (budget_spent - max(progress_percent, 1e-3)) / 100.0)
    budget_overrun = min(1.0, 0.6 * gap + 0.3 * (weather == 2) + 0.1 * min(1.0, incidents / 5.0))

    recs = []
    if delay_prob > 0.6:
        recs.append("Accélérer les phases critiques et renforcer l'équipe sur le chemin critique.")
    if budget_overrun > 0.5:
        recs.append("Réviser le plan d'achats et négocier des économies immédiates.")
    if weather == 2:
        recs.append("Adapter le planning aux conditions météo défavorables et protéger le chantier.")
    if incidents > 2:
        recs.append("Mettre en place un plan de prévention des incidents et audits sécurité.")
    if not recs:
        recs.append("Poursuivre selon le plan, surveiller jalons et coûts hebdomadaires.")

    return {
        'delay_probability': round(delay_prob * 100, 1),
        'budget_overrun_estimate': round(budget_overrun * 100, 1),
        'recommendations': recs,
    }







