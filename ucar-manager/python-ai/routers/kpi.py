from fastapi import APIRouter; router = APIRouter(); @router.get('/kpi')\ndef kpi(): return {'kpi': 100}
