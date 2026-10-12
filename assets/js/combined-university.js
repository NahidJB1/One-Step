document.addEventListener('DOMContentLoaded', () => {
  if (window.AOS) window.AOS.init({ duration: 650, once: true, offset: 70 });

  const lightbox = document.getElementById('lightbox');
  const preview = document.getElementById('lightbox-img');
  if (!lightbox || !preview) return;

  document.querySelectorAll('.gallery-item').forEach((item) => {
    item.addEventListener('click', () => {
      const image = item.querySelector('img');
      if (!image) return;
      preview.src = image.currentSrc || image.src;
      preview.alt = image.alt || 'Campus image preview';
      lightbox.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    });
  });

  const close = () => {
    lightbox.style.display = 'none';
    document.body.style.overflow = '';
  };
  lightbox.querySelector('.close-lightbox')?.addEventListener('click', close);
  lightbox.addEventListener('click', (event) => { if (event.target === lightbox) close(); });
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') close(); });
});
