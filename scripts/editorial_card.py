"""Render an original text-only editorial card from verified article JSON.

Usage: python scripts/editorial_card.py article.json
Requires Pillow and DejaVu Sans. Never fetches or modifies third-party photos.
"""
import json
import sys
import uuid
from datetime import datetime
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
FONT = Path('/usr/share/fonts/truetype/dejavu')

def font(size, bold=False):
    return ImageFont.truetype(str(FONT / ('DejaVuSans-Bold.ttf' if bold else 'DejaVuSans.ttf')), size)

def wrap(draw, text, face, width):
    lines = []
    line = ''
    for word in text.split():
        candidate = (line + ' ' + word).strip()
        if draw.textlength(candidate, font=face) > width and line:
            lines.append(line)
            line = word
        else:
            line = candidate
    if line:
        lines.append(line)
    return lines

def render(article):
    aid = str(uuid.UUID(article['id']))
    title = ' '.join(article['title'].split())
    if not title or len(title) > 300:
        raise ValueError('Invalid title')
    category = article['category']
    if category not in ['Angola', 'Mundo', 'Diáspora', 'Desporto', 'Tecnologia', 'Oportunidades']:
        raise ValueError('Invalid category')
    date = datetime.fromisoformat(article['published_at'].replace('Z', '+00:00')).strftime('%d.%m.%Y')
    im = Image.new('RGB', (1200, 1200), '#101e35')
    d = ImageDraw.Draw(im)
    d.rectangle((0, 0, 1199, 15), fill='#ec4936')
    d.text((80, 64), 'jingolokela', font=font(66, True), fill='#ffffff')
    d.text((83, 145), 'para todos.', font=font(34, True), fill='#ffffff')
    d.line((80, 222, 1120, 222), fill='#465875', width=2)
    d.text((80, 264), category.upper(), font=font(25, True), fill='#9eb7fa')
    d.text((1120, 264), date, font=font(25), anchor='ra', fill='#c7d2e3')
    # A single visible heading avoids repeating Última Hora in the headline.
    breaking = title.startswith('Última Hora: ')
    if breaking:
        title = title[len('Última Hora: '):]
    d.text((80, 342), 'ÚLTIMA HORA' if breaking else 'EM DESTAQUE', font=font(24, True), fill='#ff8b79')
    for size in range(70, 39, -2):
        face = font(size, True)
        lines = wrap(d, title, face, 1030)
        if len(lines) * (size + 18) <= 440 and all(d.textlength(line, font=face) <= 1030 for line in lines):
            break
    else:
        raise ValueError('Headline does not fit without truncation')
    y = 409
    for line in lines:
        d.text((80, y), line, font=face, fill='#ffffff')
        y += size + 18
    d.line((80, 980, 1120, 980), fill='#465875', width=2)
    d.text((80, 1019), 'LEIA A NOTÍCIA NO PORTAL', font=font(23, True), fill='#c7d2e3')
    d.text((80, 1060), 'www.jingolokela.com', font=font(36, True), fill='#ffffff')
    d.text((80, 1140), 'CARTÃO INFORMATIVO · SEM FOTOGRAFIA DO ACONTECIMENTO', font=font(17), fill='#b4c2d8')
    dest = ROOT / 'media' / 'editorial-cards' / (aid + '.jpg')
    dest.parent.mkdir(parents=True, exist_ok=True)
    if dest.exists():
        raise FileExistsError('Keep published cards immutable: ' + str(dest))
    im.save(dest, 'JPEG', quality=94, optimize=True)
    print(json.dumps({'id': aid, 'path': str(dest), 'url': 'https://www.jingolokela.com/media/editorial-cards/' + aid + '.jpg'}, ensure_ascii=False))

if __name__ == '__main__':
    render(json.loads(Path(sys.argv[1]).read_text()))
