from fastapi import FastAPI;
from employability import employability_service

app = FastAPI(); 

@app.get('/')
def read_root(): return {'Hello': 'World'}

@app.get('/employability')
def get_employability(): return employability_service.forecast()
