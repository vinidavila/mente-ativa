#!/usr/bin/env python3
"""
Mente Ativa — gera os MP3 com voz neural brasileira para todos os textos fixos do app.

Usa a biblioteca edge-tts (vozes neurais da Microsoft, gratuitas, sem chave de API).
Vozes pt-BR disponíveis: pt-BR-FranciscaNeural (feminina, calma), pt-BR-ThalitaNeural (feminina),
                          pt-BR-AntonioNeural (masculina). Ouça as três e escolha com o paciente.

Uso (PowerShell, na pasta do app):
    pip install edge-tts
    python audio\\gerar_audio.py                      # voz padrão: Francisca
    python audio\\gerar_audio.py --voz pt-BR-AntonioNeural
    python audio\\gerar_audio.py --amostra            # gera só 3 frases de cada voz para você ouvir e escolher

Saída: audio/<hash>.mp3 (um por texto) e audio/index.json (texto → arquivo).
O app procura audio/index.json ao abrir; se existir, usa o MP3 no lugar da voz do aparelho.
Depois: git add . ; git commit -m "áudio neural" ; git push
"""
import asyncio, hashlib, json, os, sys, argparse, re

def h16(t: str) -> str:
    t = re.sub(r"\s+", " ", t).strip()
    return hashlib.sha1(t.encode("utf-8")).hexdigest()[:16]

def normaliza(t: str) -> str:
    """Mesmas expansões do app (nunca abreviar): unidades, siglas e faixas."""
    pl = lambda n, s, p: s if n.replace(",", ".").strip() in ("1", "1.0") else p
    t = re.sub(r"\s+", " ", t)
    t = re.sub(r"(\d+(?:[.,]\d+)?)\s*[–\-]\s*(\d+(?:[.,]\d+)?)", r"\1 a \2", t)
    t = re.sub(r"(\d+(?:[.,]\d+)?)\s*s\b(?![a-záéíóú])", lambda m: f"{m.group(1)} {pl(m.group(1),'segundo','segundos')}", t, flags=re.I)
    t = re.sub(r"(\d+(?:[.,]\d+)?)\s*seg\b", lambda m: f"{m.group(1)} {pl(m.group(1),'segundo','segundos')}", t, flags=re.I)
    t = re.sub(r"(\d+(?:[.,]\d+)?)\s*min\b", lambda m: f"{m.group(1)} {pl(m.group(1),'minuto','minutos')}", t, flags=re.I)
    t = re.sub(r"(\d+(?:[.,]\d+)?)\s*rep\b", lambda m: f"{m.group(1)} {pl(m.group(1),'repetição','repetições')}", t, flags=re.I)
    t = re.sub(r"(\d+(?:[.,]\d+)?)\s*(?:×|x)\s*(?=\d)", r"\1 vezes ", t, flags=re.I)
    t = re.sub(r"(séries?|sessões?)\s*(?:×|x)\s*", r"\1 de ", t, flags=re.I)
    t = re.sub(r"(\d+)\s*/\s*(\d+)", r"\1 de \2", t)
    t = re.sub(r"(\d+(?:[.,]\d+)?)\s*kg\b", r"\1 quilos", t, flags=re.I)
    t = re.sub(r"(\d+(?:[.,]\d+)?)\s*cm\b", r"\1 centímetros", t, flags=re.I)
    t = re.sub(r"(\d+(?:[.,]\d+)?)\s*m/s\b", r"\1 metros por segundo", t, flags=re.I)
    t = re.sub(r"(\d+(?:[.,]\d+)?)\s*%", r"\1 por cento", t)
    t = t.replace("PSE", "esforço percebido").replace("1RM", "da carga máxima").replace("≈", "aproximadamente ").replace("≥", "pelo menos").replace("≤", "no máximo")
    t = re.sub(r"\bdias?/sem\b", "dias por semana", t, flags=re.I).replace("/sem", " por semana")
    t = re.sub(r"\bex\.:?", "por exemplo:", t, flags=re.I).replace("Dr. ", "Doutor ").replace("Dra. ", "Doutora ")
    t = re.sub(r"\bséc\.\s?", "século ", t, flags=re.I).replace("a.C.", "antes de Cristo").replace("d.C.", "depois de Cristo")
    t = t.replace("MMSS", "membros superiores").replace("MMII", "membros inferiores").replace("OMS", "Organização Mundial da Saúde").replace("SPPB", "teste de desempenho físico").replace("VM ", "velocidade de marcha ")
    t = t.replace("DNA", "D N A").replace("TV", "T V").replace("GPS", "G P S").replace("ONU", "O N U")
    t = re.sub(r"\s*·\s*", ", ", t); t = re.sub(r"\s*→\s*", ", depois ", t); t = re.sub(r"\s*\(([^)]*)\)", r", \1,", t)
    t = re.sub(r"[💡“”\"]", "", t); t = re.sub(r"\s{2,}", " ", t); t = re.sub(r",\s*,", ",", t)
    return t.strip()

async def gerar(textos, voz, pasta, rate="-8%", pitch="+0Hz"):
    import edge_tts
    idx_path = os.path.join(pasta, "index.json")
    idx = json.load(open(idx_path, encoding="utf-8")) if os.path.exists(idx_path) else {}
    feitos = 0
    for i, t in enumerate(textos, 1):
        k = h16(t); f = f"{k}.mp3"; out = os.path.join(pasta, f)
        if os.path.exists(out) and idx.get(k) == f:
            continue
        com = edge_tts.Communicate(normaliza(t), voz, rate=rate, pitch=pitch)
        try:
            await com.save(out)
            idx[k] = f; feitos += 1
            print(f"[{i}/{len(textos)}] {t[:60]}…", flush=True)
        except Exception as e:
            print(f"[{i}/{len(textos)}] ERRO: {e}", flush=True)
        if feitos % 10 == 0:
            json.dump(idx, open(idx_path, "w", encoding="utf-8"), ensure_ascii=False, indent=0)
    json.dump(idx, open(idx_path, "w", encoding="utf-8"), ensure_ascii=False, indent=0)
    print(f"\nPronto: {feitos} novos, {len(idx)} no total → {idx_path}")

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--voz", default="pt-BR-FranciscaNeural")
    ap.add_argument("--rate", default="-8%", help="velocidade (ex.: -8%% mais lento, +0%% normal)")
    ap.add_argument("--amostra", action="store_true", help="gera 3 frases em cada voz pt-BR para você escolher")
    a = ap.parse_args()
    pasta = os.path.dirname(os.path.abspath(__file__))
    textos = json.load(open(os.path.join(pasta, "textos.json"), encoding="utf-8"))
    if a.amostra:
        amostra = ["Bom dia! Que bom te ver por aqui. Conseguiu fazer sua caminhada hoje?",
                   "Sentar e levantar da cadeira. Passo 1: sentado na borda da cadeira, pés na largura do quadril.",
                   "Um dia bem vivido já é uma vitória."]
        for voz in ["pt-BR-FranciscaNeural", "pt-BR-ThalitaNeural", "pt-BR-AntonioNeural"]:
            d = os.path.join(pasta, "amostras", voz); os.makedirs(d, exist_ok=True)
            asyncio.run(gerar(amostra, voz, d, rate=a.rate))
        print("\nOuça em audio/amostras/<voz>/ e rode de novo com --voz <a escolhida>.")
        return
    asyncio.run(gerar(textos, a.voz, pasta, rate=a.rate))

if __name__ == "__main__":
    main()
