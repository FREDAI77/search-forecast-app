# ML Inference Service
Servizio esterno per il calcolo delle previsioni. Da deployare su Render, Cloud Run o AWS Lambda.

## Deploy locale
```bash
pip install -r requirements.txt
uvicorn main:app --reload