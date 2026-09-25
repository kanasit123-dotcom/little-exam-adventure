export const ASSETS = Object.freeze({
  'friend-cat': { src: '/assets/friends/cat.png', alt: { th: 'แมว', en: 'Cat' } },
  'friend-seal': { src: '/assets/friends/seal.png', alt: { th: 'แมวน้ำ', en: 'Seal' } },
  'friend-rabbit': { src: '/assets/friends/rabbit.png', alt: { th: 'กระต่าย', en: 'Rabbit' } },
  'sticker-star': { src: '/assets/stickers/star.png', alt: { th: 'ดาว', en: 'Star' } },
  'sticker-rainbow': { src: '/assets/stickers/rainbow.png', alt: { th: 'สายรุ้ง', en: 'Rainbow' } },
  'background-rainbow': { src: '/assets/backgrounds/rainbow.jpg', alt: { th: '', en: '' }, decorative: true },
});

export function asset(id) {
  const entry = ASSETS[id];
  if (!entry) throw new Error(`Unknown asset: ${id}`);
  return entry;
}

