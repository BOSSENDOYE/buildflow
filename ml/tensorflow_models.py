"""
Modèles TensorFlow avancés pour la prédiction du suivi de chantier
"""
import numpy as np
import pandas as pd
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
from sklearn.preprocessing import MinMaxScaler
from typing import Dict, Tuple, List
import os

class ConstructionLSTM:
    """Modèle LSTM pour la prédiction temporelle des chantiers"""
    
    def __init__(self, sequence_length: int = 30, features: int = 8):
        self.sequence_length = sequence_length
        self.features = features
        self.model = None
        self.scaler = MinMaxScaler()
        
    def build_model(self) -> keras.Model:
        """Construit le modèle LSTM"""
        model = keras.Sequential([
            layers.LSTM(128, return_sequences=True, input_shape=(self.sequence_length, self.features)),
            layers.Dropout(0.2),
            layers.LSTM(64, return_sequences=True),
            layers.Dropout(0.2),
            layers.LSTM(32),
            layers.Dense(16, activation='relu'),
            layers.Dense(2, activation='sigmoid')  # [delay_prob, budget_overrun_prob]
        ])
        
        model.compile(
            optimizer='adam',
            loss='mse',
            metrics=['mae']
        )
        return model
    
    def prepare_sequences(self, data: pd.DataFrame, target_cols: List[str]) -> Tuple[np.ndarray, np.ndarray]:
        """Prépare les séquences temporelles"""
        sequences = []
        targets = []
        
        # Normaliser les données
        scaled_data = self.scaler.fit_transform(data.drop(columns=target_cols))
        target_data = data[target_cols].values
        
        for i in range(len(data) - self.sequence_length):
            seq = scaled_data[i:i + self.sequence_length]
            target = target_data[i + self.sequence_length - 1]
            sequences.append(seq)
            targets.append(target)
            
        return np.array(sequences), np.array(targets)
    
    def train(self, X: np.ndarray, y: np.ndarray, epochs: int = 50, batch_size: int = 32) -> Dict:
        """Entraîne le modèle LSTM"""
        self.model = self.build_model()
        
        history = self.model.fit(
            X, y,
            epochs=epochs,
            batch_size=batch_size,
            validation_split=0.2,
            verbose=1
        )
        
        return {
            'loss': history.history['loss'][-1],
            'val_loss': history.history['val_loss'][-1],
            'mae': history.history['mae'][-1],
            'val_mae': history.history['val_mae'][-1]
        }

class ConstructionDenseNN:
    """Réseau de neurones dense pour la prédiction statique"""
    
    def __init__(self, input_dim: int = 8):
        self.input_dim = input_dim
        self.model = None
        
    def build_model(self) -> keras.Model:
        """Construit le réseau dense"""
        model = keras.Sequential([
            layers.Dense(64, activation='relu', input_shape=(self.input_dim,)),
            layers.Dropout(0.3),
            layers.Dense(32, activation='relu'),
            layers.Dropout(0.2),
            layers.Dense(16, activation='relu'),
            layers.Dense(2, activation='sigmoid')
        ])
        
        model.compile(
            optimizer='adam',
            loss='mse',
            metrics=['mae']
        )
        return model
    
    def train(self, X: np.ndarray, y: np.ndarray, epochs: int = 100, batch_size: int = 32) -> Dict:
        """Entraîne le réseau dense"""
        self.model = self.build_model()
        
        history = self.model.fit(
            X, y,
            epochs=epochs,
            batch_size=batch_size,
            validation_split=0.2,
            verbose=0
        )
        
        return {
            'loss': history.history['loss'][-1],
            'val_loss': history.history['val_loss'][-1],
            'mae': history.history['mae'][-1],
            'val_mae': history.history['val_mae'][-1]
        }

class TensorFlowPredictor:
    """Prédicteur TensorFlow unifié"""
    
    def __init__(self, model_path: str = None):
        self.model_path = model_path or os.path.join(os.path.dirname(__file__), 'artifacts', 'tensorflow_models')
        self.lstm_model = None
        self.dense_model = None
        
    def load_models(self):
        """Charge les modèles TensorFlow"""
        try:
            self.lstm_model = keras.models.load_model(os.path.join(self.model_path, 'lstm_model'))
            self.dense_model = keras.models.load_model(os.path.join(self.model_path, 'dense_model'))
            print("Modèles TensorFlow chargés avec succès")
        except Exception as e:
            print(f"Erreur chargement modèles TensorFlow: {e}")
            self.lstm_model = None
            self.dense_model = None
    
    def predict_lstm(self, sequence: np.ndarray) -> Dict[str, float]:
        """Prédiction avec LSTM"""
        if self.lstm_model is None:
            raise ValueError("Modèle LSTM non chargé")
        
        prediction = self.lstm_model.predict(sequence.reshape(1, -1, 8))
        return {
            'delay_probability': float(prediction[0][0]),
            'budget_overrun_probability': float(prediction[0][1])
        }
    
    def predict_dense(self, features: np.ndarray) -> Dict[str, float]:
        """Prédiction avec réseau dense"""
        if self.dense_model is None:
            raise ValueError("Modèle dense non chargé")
        
        prediction = self.dense_model.predict(features.reshape(1, -1))
        return {
            'delay_probability': float(prediction[0][0]),
            'budget_overrun_probability': float(prediction[0][1])
        }
