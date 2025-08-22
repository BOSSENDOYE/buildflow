import os
import pickle
from dataclasses import dataclass
from typing import Tuple

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import roc_auc_score


@dataclass
class TrainConfig:
    random_state: int = 42
    test_size: float = 0.2
    n_estimators: int = 200
    max_depth: int | None = None
    model_dir: str = os.path.join(os.path.dirname(__file__), 'artifacts')
    model_path: str = os.path.join(model_dir, 'buildflow_rf.pkl')


def _ensure_dirs(path: str) -> None:
    os.makedirs(path, exist_ok=True)


def load_dataset(csv_path: str | None = None) -> pd.DataFrame:
    if csv_path and os.path.exists(csv_path):
        return pd.read_csv(csv_path)
    # Dataset d'exemple synthétique
    rng = np.random.default_rng(123)
    n = 500
    progress = rng.uniform(0, 100, size=n)  # % avancement
    budget_spent = rng.uniform(0, 100, size=n)  # % budget dépensé
    weather = rng.integers(0, 3, size=n)  # 0=bon,1=moyen,2=mauvais
    incidents = rng.integers(0, 6, size=n)  # nb incidents
    # Cible binaire: retard (1) vs pas de retard (0), heuristique
    delay = (budget_spent > progress + 10).astype(int)
    df = pd.DataFrame({
        'progress_percent': progress,
        'budget_spent': budget_spent,
        'weather': weather,
        'incidents': incidents,
        'delay': delay,
    })
    return df


def train_model(df: pd.DataFrame, cfg: TrainConfig) -> Tuple[RandomForestClassifier, float]:
    X = df[['progress_percent', 'budget_spent', 'weather', 'incidents']]
    y = df['delay']
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=cfg.test_size, random_state=cfg.random_state, stratify=y)
    model = RandomForestClassifier(
        n_estimators=cfg.n_estimators,
        max_depth=cfg.max_depth,
        random_state=cfg.random_state,
        n_jobs=-1,
    )
    model.fit(X_train, y_train)
    proba = model.predict_proba(X_test)[:, 1]
    auc = roc_auc_score(y_test, proba)
    return model, auc


def save_model(model: RandomForestClassifier, cfg: TrainConfig) -> str:
    _ensure_dirs(cfg.model_dir)
    with open(cfg.model_path, 'wb') as f:
        pickle.dump(model, f)
    return cfg.model_path


if __name__ == '__main__':
    cfg = TrainConfig()
    csv_path = os.environ.get('BUILDFLOW_TRAIN_CSV')  # optionnel
    df = load_dataset(csv_path)
    model, auc = train_model(df, cfg)
    path = save_model(model, cfg)
    print(f"Modèle entraîné. AUC={auc:.3f}. Sauvegardé: {path}")







