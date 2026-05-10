import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import holidays
import requests
import os

# Inizializza calendario festività italiane
IT_HOLIDAYS = holidays.Italy(years=range(2020, 2030))

def build_future_features(keyword: str, horizon: int = 30) -> pd.DataFrame:
    """
    Genera DataFrame con feature temporali + socio-economiche per l'orizzonte di previsione.
    """
    dates = pd.date_range(start=datetime.now().date(), periods=horizon, freq='D')
    df = pd.DataFrame({'ds': dates})
    
    # Feature temporali
    df['month'] = df['ds'].dt.month
    df['day_of_week'] = df['ds'].dt.dayofweek
    df['is_weekend'] = df['day_of_week'].isin([5, 6]).astype(int)
    
    # Festività italiane (binary + nome)
    df['is_italian_holiday'] = df['ds'].dt.date.apply(lambda d: 1 if d in IT_HOLIDAYS else 0)
    df['holiday_name'] = df['ds'].dt.date.apply(lambda d: IT_HOLIDAYS.get(d, ''))
    
    # Meteo (stub: sostituire con chiamata OpenWeatherMap/Meteosource reale)
    df['avg_temperature'] = _fetch_weather_forecast(dates, location='IT')
    
    # Geopolitical Risk Index (stub: sostituire con dati Iacoviello/BBVA)
    df['gpr_index'] = _fetch_gpr_index(dates)
    
    # Lag features storici (verranno popolati dal contesto storico passato alla predict)
    # Nel training si usano shift(7), shift(14), shift(30)
    
    return df

def _fetch_weather_forecast(dates: pd.DatetimeIndex, location: str) -> list:
    """
    Placeholder per integrazione API meteo.
    In produzione: chiamate cached a OpenWeatherMap One Call API.
    """
    # Simulazione stagionale realistica per l'Italia
    base_temps = {1:8, 2:9, 3:12, 4:16, 5:20, 6:24, 7:27, 8:26, 9:22, 10:17, 11:12, 12:8}
    return [base_temps.get(d.month, 15) + np.random.normal(0, 2) for d in dates]

def _fetch_gpr_index(dates: pd.DatetimeIndex) -> list:
    """
    Placeholder per Geopolitical Risk Index.
    In produzione: caricamento CSV mensile interpolato o API economica.
    """
    # Valore base normalizzato (0-100), aggiornato mensilmente
    base_gpr = 45.0
    return [base_gpr + np.random.normal(0, 3) for _ in dates]

def prepare_prophet_dataframe(historical_ list[dict], future_df: pd.DataFrame) -> pd.DataFrame:
    """
    Unisce dati storici + future features nel formato richiesto da Prophet.
    """
    hist_df = pd.DataFrame(historical_data)
    hist_df['ds'] = pd.to_datetime(hist_df['date'])
    hist_df['y'] = hist_df['value'].astype(float)
    
    # Aggiungi regressori storici (stessi nomi delle future features)
    hist_df['is_italian_holiday'] = hist_df['ds'].dt.date.apply(lambda d: 1 if d in IT_HOLIDAYS else 0)
    hist_df['avg_temperature'] = _fetch_weather_forecast(hist_df['ds'], 'IT')
    hist_df['gpr_index'] = _fetch_gpr_index(hist_df['ds'])
    
    # Unisci e ordina
    full_df = pd.concat([hist_df[['ds', 'y', 'is_italian_holiday', 'avg_temperature', 'gpr_index']], 
                         future_df[['ds', 'is_italian_holiday', 'avg_temperature', 'gpr_index']]], 
                        ignore_index=True)
    return full_df.sort_values('ds').reset_index(drop=True)