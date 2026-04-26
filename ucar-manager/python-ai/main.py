from fastapi import FastAPI; app = FastAPI(); @app.get('/')\ndef read_root(): return {'Hello': 'World'}
