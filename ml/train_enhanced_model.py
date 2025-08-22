"""
Enhanced ML training script with improved models and TensorFlow support
"""
import os
import pickle
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, r2_score
from sklearn.preprocessing import StandardScaler
import warnings
warnings.filterwarnings('ignore')

# Import our enhanced dataset
from enhanced_dataset import generate_construction_dataset, save_dataset

MODEL_DIR = os.path.join(os.path.dirname(__file__), 'artifacts')

def train_enhanced_models():
    """Train enhanced models for delay and budget overrun prediction"""
    print("Generating enhanced dataset...")
    df = generate_construction_dataset(2000)
    
    # Features for prediction
    feature_cols = [
        'progress_percent', 'budget_spent', 'weather', 'incidents',
        'team_size', 'team_experience', 'permit_delays', 'supply_chain_issues'
    ]
    
    X = df[feature_cols]
    y_delay = df['delay_probability'] * 100  # Convert to percentage
    y_budget = df['budget_overrun_probability'] * 100
    
    # Split data
    X_train, X_test, y_train_delay, y_test_delay = train_test_split(
        X, y_delay, test_size=0.2, random_state=42
    )
    _, _, y_train_budget, y_test_budget = train_test_split(
        X, y_budget, test_size=0.2, random_state=42
    )
    
    # Scale features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # Train delay prediction model
    print("Training delay prediction model...")
    delay_model = RandomForestRegressor(
        n_estimators=300,
        max_depth=15,
        min_samples_split=5,
        random_state=42,
        n_jobs=-1
    )
    delay_model.fit(X_train_scaled, y_train_delay)
    
    # Train budget overrun model
    print("Training budget overrun model...")
    budget_model = RandomForestRegressor(
        n_estimators=300,
        max_depth=15,
        min_samples_split=5,
        random_state=42,
        n_jobs=-1
    )
    budget_model.fit(X_train_scaled, y_train_budget)
    
    # Evaluate models
    delay_pred = delay_model.predict(X_test_scaled)
    budget_pred = budget_model.predict(X_test_scaled)
    
    metrics = {
        'delay_mae': mean_absolute_error(y_test_delay, delay_pred),
        'delay_r2': r2_score(y_test_delay, delay_pred),
        'budget_mae': mean_absolute_error(y_test_budget, budget_pred),
        'budget_r2': r2_score(y_test_budget, budget_pred)
    }
    
    print("\nModel Performance:")
    print(f"Delay Prediction - MAE: {metrics['delay_mae']:.2f}%, R²: {metrics['delay_r2']:.3f}")
    print(f"Budget Prediction - MAE: {metrics['budget_mae']:.2f}%, R²: {metrics['budget_r2']:.3f}")
    
    # Save models and scaler
    os.makedirs(MODEL_DIR, exist_ok=True)
    
    model_data = {
        'delay_model': delay_model,
        'budget_model': budget_model,
        'scaler': scaler,
        'feature_cols': feature_cols,
        'metrics': metrics
    }
    
    model_path = os.path.join(MODEL_DIR, 'enhanced_models.pkl')
    with open(model_path, 'wb') as f:
        pickle.dump(model_data, f)
    
    print(f"\nModels saved to: {model_path}")
    return model_path, metrics

if __name__ == "__main__":
    train_enhanced_models()
