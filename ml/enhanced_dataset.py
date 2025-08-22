"""
Enhanced dataset generation for construction project analysis
"""
import os
import numpy as np
import pandas as pd
from typing import Dict, List, Tuple

def generate_construction_dataset(n_samples: int = 1000) -> pd.DataFrame:
    """Generate realistic construction project dataset"""
    np.random.seed(42)
    
    project_types = ['RESIDENTIAL', 'COMMERCIAL', 'INFRASTRUCTURE', 'INDUSTRIAL']
    weather_conditions = ['GOOD', 'FAIR', 'POOR']
    
    data = []
    for _ in range(n_samples):
        # Project characteristics
        project_type = np.random.choice(project_types)
        initial_budget = np.random.uniform(100000, 10000000)
        planned_duration = np.random.randint(30, 730)
        
        # Progress metrics
        actual_progress = np.random.uniform(0, 100)
        
        # Budget consumption with realistic patterns
        budget_efficiency = np.random.beta(2, 2)
        budget_spent = actual_progress * budget_efficiency * np.random.uniform(0.8, 1.2)
        
        # Weather impact
        weather = np.random.choice([0, 1, 2], p=[0.6, 0.3, 0.1])
        
        # Incidents
        incidents = np.random.poisson(1) if weather == 2 else np.random.poisson(0.5)
        
        # Team factors
        team_size = np.random.randint(5, 50)
        team_experience = np.random.uniform(1, 10)
        
        # External factors
        permit_delays = np.random.choice([0, 1, 2], p=[0.7, 0.2, 0.1])
        supply_chain_issues = np.random.choice([0, 1, 2], p=[0.8, 0.15, 0.05])
        
        # Calculate realistic targets
        delay_risk = (
            (budget_spent > actual_progress + 15) * 0.4 +
            (weather == 2) * 0.3 +
            (incidents > 2) * 0.2 +
            (permit_delays > 0) * 0.1
        )
        
        budget_overrun_risk = (
            (budget_spent > actual_progress) * 0.5 +
            (supply_chain_issues > 0) * 0.3 +
            (weather == 2) * 0.2
        )
        
        data.append({
            'project_type': project_type,
            'initial_budget': initial_budget,
            'planned_duration': planned_duration,
            'progress_percent': actual_progress,
            'budget_spent': budget_spent,
            'weather': weather,
            'incidents': incidents,
            'team_size': team_size,
            'team_experience': team_experience,
            'permit_delays': permit_delays,
            'supply_chain_issues': supply_chain_issues,
            'delay_probability': min(1.0, delay_risk),
            'budget_overrun_probability': min(1.0, budget_overrun_risk)
        })
    
    return pd.DataFrame(data)

def save_dataset(df: pd.DataFrame, filename: str = 'construction_dataset.csv'):
    """Save dataset to file"""
    dataset_path = os.path.join(os.path.dirname(__file__), 'data', filename)
    os.makedirs(os.path.dirname(dataset_path), exist_ok=True)
    df.to_csv(dataset_path, index=False)
    return dataset_path

if __name__ == "__main__":
    df = generate_construction_dataset(1000)
    path = save_dataset(df)
    print(f"Dataset generated with {len(df)} samples saved to: {path}")
