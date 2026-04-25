from fastapi import APIRouter; router = APIRouter(); @router.post('/chat')\ndef chat(): return {'response': 'AI'}
