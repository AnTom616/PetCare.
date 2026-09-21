#!/usr/bin/env python3
"""
gerar_icones_petcare.py — Gera os ícones do PWA PetCare São Mateus
Cria icon-512.png e icon-192.png (PNG com cantos arredondados):
  - Fundo: gradiente vertical verde (#2E7D32 -> #1B5E20)
  - Badge circular laranja suave (#FF8A65)
  - Pegada de pata branca centralizada + pata "marca d'água" decorativa

Uso:
    pip install pillow   (se necessário)
    python gerar-icones.py
Os arquivos são salvos na mesma pasta do script.
"""
import os
from PIL import Image, ImageDraw

TAM = 512
MARGEM = 300  # folga para desenhar patas parcialmente fora do canvas

VERDE_TOPO = (46, 125, 50)     # #2E7D32
VERDE_BASE = (27, 94, 32)      # #1B5E20
LARANJA = (255, 138, 101)      # #FF8A65
BRANCO = (255, 255, 255, 255)


def fundo_gradiente(tam):
    """Retorna imagem quadrada com gradiente vertical verde."""
    img = Image.new("RGB", (tam, tam), VERDE_TOPO)
    d = ImageDraw.Draw(img)
    for y in range(tam):
        t = y / (tam - 1)
        cor = tuple(int(VERDE_TOPO[i] + (VERDE_BASE[i] - VERDE_TOPO[i]) * t) for i in range(3))
        d.line([(0, y), (tam, y)], fill=cor)
    return img.convert("RGBA")


def elipse_rotacionada(camada, cx, cy, largura, altura, angulo, cor):
    """Desenha uma elipse rotacionada centralizada em (cx, cy) dentro da camada."""
    tmp = Image.new("RGBA", (int(largura * 2), int(altura * 2)), (0, 0, 0, 0))
    ImageDraw.Draw(tmp).ellipse(
        [largura // 2, altura // 2, largura // 2 + largura, altura // 2 + altura],
        fill=cor,
    )
    tmp = tmp.rotate(angulo, expand=True, resample=Image.BICUBIC)
    camada.alpha_composite(tmp, (int(cx - tmp.width / 2), int(cy - tmp.height / 2)))


def desenhar_pata(camada, cx, cy, escala, cor, angulo=0):
    """Desenha uma pata (palma + 4 dedos) centralizada em (cx, cy).

    Geometria definida em um espaço de referência de 512px e escalada.
    """
    ox, oy = cx + MARGEM, cy + MARGEM  # offset da camada com folga

    def E(px, py, w, h, ang):
        elipse_rotacionada(
            camada,
            ox + px * escala,
            oy + py * escala,
            w * escala,
            h * escala,
            ang,
            cor,
        )

    c, s = __import__("math").cos(__import__("math").radians(angulo)), __import__("math").sin(__import__("math").radians(angulo))

    def girar(px, py):
        """Gira o ponto (px, py) em torno do centro da pata."""
        return (px * c - py * s, px * s + py * c)

    # Palma da pata
    px, py = girar(0, 24)
    E(px, py, 176 * escala, 150 * escala, -angulo)
    # Dedos (do internos e dois externos, em arco)
    for fx, fy, ang in ((-84, -110, 12), (84, -110, -12), (-156, -38, 30), (156, -38, -30)):
        px, py = girar(fx * escala, fy * escala)
        w, h = (78, 108) if abs(fx) < 120 else (70, 100)
        E(px, py, w * escala, h * escala, ang)


def gerar_icone(tam_saida, caminho):
    """Gera o ícone completo no tamanho informado e salva como PNG."""
    img = fundo_gradiente(TAM)
    camada = Image.new("RGBA", (TAM + MARGEM * 2, TAM + MARGEM * 2), (0, 0, 0, 0))

    # Marca d'água decorativa (pata grande semitransparente, canto inferior direito)
    sombra = (255, 255, 255, 26)
    desenhar_pata(camada, 430, 470, 1.6, sombra, angulo=18)

    # Badge circular laranja
    centro = TAM // 2 + MARGEM
    raio = 196
    ImageDraw.Draw(camada).ellipse(
        [centro - raio, centro - 18 - raio, centro + raio, centro - 18 + raio],
        fill=LARANJA,
    )

    # Pata principal branca
    desenhar_pata(camada, TAM // 2, TAM // 2 + 12, 0.92, BRANCO)

    img = Image.alpha_composite(img, camada.crop((MARGEM, MARGEM, MARGEM + TAM, MARGEM + TAM)))

    # Cantos arredondados (máscara alfa)
    mascara = Image.new("L", (TAM, TAM), 0)
    ImageDraw.Draw(mascara).rounded_rectangle([0, 0, TAM - 1, TAM - 1], radius=116, fill=255)
    img.putalpha(mascara)

    final = img.resize((tam_saida, tam_saida), Image.LANCZOS)
    final.save(caminho, format="PNG", optimize=True)
    return caminho


if __name__ == "__main__":
    pasta = os.path.dirname(os.path.abspath(__file__))
    for tamanho in (512, 192):
        destino = os.path.join(pasta, f"icon-{tamanho}.png")
        gerar_icone(tamanho, destino)
        kb = os.path.getsize(destino) / 1024
        print(f"OK  {destino}  ({kb:.1f} KB)")
