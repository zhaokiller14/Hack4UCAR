from fastapi import APIRouter; router = APIRouter(); @router.post('/extract')\ndef extract(): return {'status': 'processed'}
