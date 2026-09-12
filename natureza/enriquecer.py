#!/usr/bin/env python3
"""
Mente Ativa — módulo Natureza
Gera natureza.json a partir de sementes.csv usando apenas fontes abertas e licenciadas:

  1. GBIF Species Match  (api.gbif.org)  -> valida o nome científico (status, sinônimo, família)
  2. Wikipédia PT        (pt.wikipedia.org/w/api.php) -> resumo em português (CC BY-SA 4.0, exige atribuição)
  3. Wikimedia Commons   (commons.wikimedia.org/w/api.php) -> >= 5 fotos com licença livre, autor e link

Uso:
  pip install requests
  python enriquecer.py                 # gera natureza.json (pode levar ~30-60 min para ~600 itens)
  python enriquecer.py --min-fotos 5 --so planta

O arquivo de saída é o que o app lê. Cada item guarda a atribuição de texto e de cada foto —
isso é obrigatório pelas licenças CC BY / CC BY-SA e deve ser exibido no app.

Validação botânica adicional (manual, recomendada): Flora e Funga do Brasil (JBRJ)
  https://floradobrasil.jbrj.gov.br  — conferir nomes marcados como "SYNONYM" ou "FUZZY" pelo GBIF.
"""
import csv, json, sys, time, argparse, re
import requests

UA = {"User-Agent": "MenteAtiva/1.0 (app educativo para idosos; contato do responsável no repositório)"}
S = requests.Session(); S.headers.update(UA)
LIC_OK = re.compile(r"(cc-by|cc0|public domain|pd-|gfdl|cc by)", re.I)

def gbif(nome):
    try:
        r = S.get("https://api.gbif.org/v1/species/match", params={"name": nome, "strict": "false"}, timeout=20).json()
        return {"match": r.get("matchType"), "status": r.get("status"), "familia": r.get("family"),
                "nome_aceito": r.get("canonicalName"), "confianca": r.get("confidence")}
    except Exception as e:
        return {"erro": str(e)}

def wiki_pt(*candidatos):
    """Procura a página em pt.wikipedia por cada candidato; devolve resumo + imagem principal."""
    for q in candidatos:
        if not q: continue
        try:
            s = S.get("https://pt.wikipedia.org/w/api.php", params={
                "action": "query", "list": "search", "srsearch": q, "srlimit": 1, "format": "json"}, timeout=20).json()
            hits = s["query"]["search"]
            if not hits: continue
            title = hits[0]["title"]
            p = S.get("https://pt.wikipedia.org/w/api.php", params={
                "action": "query", "prop": "extracts|pageimages|info", "exintro": 1, "explaintext": 1,
                "piprop": "original", "inprop": "url", "titles": title, "format": "json", "redirects": 1}, timeout=20).json()
            page = next(iter(p["query"]["pages"].values()))
            texto = page.get("extract", "").strip()
            if len(texto) < 80: continue
            return {"titulo": title, "url": page.get("fullurl"), "texto": texto[:1500],
                    "imagem_principal": (page.get("original") or {}).get("source"),
                    "licenca_texto": "CC BY-SA 4.0 — Wikipédia, a enciclopédia livre"}
        except Exception:
            continue
    return None

def commons(nome_cientifico, nome_popular, minimo=5):
    """Busca fotos no Commons; devolve até 8 com licença livre, autor e link de atribuição."""
    fotos, vistos = [], set()
    for q in (nome_cientifico, f"{nome_cientifico} tree", f"{nome_cientifico} flower", nome_popular):
        if len(fotos) >= 8 or not q: break
        try:
            r = S.get("https://commons.wikimedia.org/w/api.php", params={
                "action": "query", "generator": "search", "gsrsearch": f"filetype:bitmap {q}", "gsrnamespace": 6,
                "gsrlimit": 20, "prop": "imageinfo", "iiprop": "url|extmetadata|size", "iiurlwidth": 1280,
                "format": "json"}, timeout=30).json()
        except Exception:
            continue
        for pg in (r.get("query", {}).get("pages", {}) or {}).values():
            ii = (pg.get("imageinfo") or [{}])[0]; md = ii.get("extmetadata", {})
            lic = (md.get("LicenseShortName", {}) or {}).get("value", "")
            if not LIC_OK.search(lic): continue                      # só licenças livres
            if ii.get("width", 0) < 600: continue                     # tamanho mínimo para TV
            url = ii.get("thumburl") or ii.get("url")
            if url in vistos: continue
            vistos.add(url)
            autor = re.sub("<[^>]+>", "", (md.get("Artist", {}) or {}).get("value", "")).strip()[:80]
            fotos.append({"url": url, "pagina": ii.get("descriptionurl"), "licenca": lic, "autor": autor or "autor não informado",
                          "atribuicao": f"{autor or 'Wikimedia Commons'} — {lic} — via Wikimedia Commons"})
    return fotos

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--entrada", default="sementes.csv"); ap.add_argument("--saida", default="natureza.json")
    ap.add_argument("--min-fotos", type=int, default=5); ap.add_argument("--so", help="filtrar categoria (planta, cachorro, gato, gado, cavalo, ave)")
    ap.add_argument("--pausa", type=float, default=0.5, help="segundos entre itens (respeito às APIs)")
    a = ap.parse_args()

    linhas = list(csv.DictReader(open(a.entrada, encoding="utf-8")))
    if a.so: linhas = [l for l in linhas if l["categoria"] == a.so]
    saida, pendentes = [], []
    try:
        saida = json.load(open(a.saida, encoding="utf-8"))
    except Exception:
        pass
    feitos = {(x["categoria"], x["nome_popular"]) for x in saida}

    for i, l in enumerate(linhas, 1):
        chave = (l["categoria"], l["nome_popular"])
        if chave in feitos: continue
        print(f"[{i}/{len(linhas)}] {l['nome_popular']} ({l['nome_cientifico']})", flush=True)
        item = dict(l)
        item["gbif"] = gbif(l["nome_cientifico"]) if l["categoria"] in ("planta", "ave") else None
        item["wiki"] = wiki_pt(l["nome_cientifico"], l["nome_popular"])
        item["fotos"] = commons(l["nome_cientifico"] if l["categoria"] in ("planta", "ave") else l["nome_popular"], l["nome_popular"])
        item["pendencias"] = []
        if not item["wiki"]: item["pendencias"].append("sem_texto_wikipedia_pt")
        if len(item["fotos"]) < a.min_fotos: item["pendencias"].append(f"fotos_insuficientes_{len(item['fotos'])}")
        g = item["gbif"] or {}
        if g and g.get("match") in (None, "NONE", "FUZZY") or g.get("status") == "SYNONYM":
            item["pendencias"].append("conferir_nome_cientifico")
        if item["pendencias"]: pendentes.append((l["nome_popular"], item["pendencias"]))
        saida.append(item)
        json.dump(saida, open(a.saida, "w", encoding="utf-8"), ensure_ascii=False, indent=1)   # salva incremental
        time.sleep(a.pausa)

    print(f"\nConcluído: {len(saida)} itens em {a.saida}")
    if pendentes:
        print(f"\n{len(pendentes)} itens com pendências (revisar manualmente):")
        for n, p in pendentes: print(f"  - {n}: {', '.join(p)}")
        with open("pendencias.txt", "w", encoding="utf-8") as f:
            for n, p in pendentes: f.write(f"{n}\t{', '.join(p)}\n")

if __name__ == "__main__":
    main()
