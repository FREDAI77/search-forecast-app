import os
import joblib
import logging
from prophet import Prophet

logger = logging.getLogger(__name__)

MODEL_PATH = os.path.join(os.path.dirname(__file__), 'models', 'prophet_v2.pkl')

def load_prophet_model() -> Prophet:
    """
    Carica modello Prophet addestrato offline.
    In produzione: validare schema, versioning, fallback su modello base.
    """
    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(f"Modello non trovato: {MODEL_PATH}. Eseguire training offline prima del deploy.")
    
    try:
        model = joblib.load(MODEL_PATH)
        logger.info(f"Modello caricato con successo da {MODEL_PATH}")
        return model
    except Exception as e:
        logger.error(f"Errore caricamento modello: {e}")
        raise