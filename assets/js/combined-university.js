document.addEventListener('DOMContentLoaded', () => {
  if (window.AOS) window.AOS.init({ duration: 650, once: true, offset: 70 });

  const overview = document.getElementById('overview');
  const courses = document.getElementById('courses');
  const articles = document.getElementById('articles');
  const accommodation = document.getElementById('accommodation');
  const tabStrip = document.querySelector('.combined-tabs');
  const moreTabs = document.querySelector('.combined-tabs-more');
  const updateMoreTabs = () => {
    if (!tabStrip || !moreTabs) return;
    moreTabs.hidden = !window.matchMedia('(max-width: 760px)').matches ||
      tabStrip.scrollLeft + tabStrip.clientWidth >= tabStrip.scrollWidth - 2;
  };
  tabStrip?.addEventListener('scroll', updateMoreTabs, {passive:true});
  window.addEventListener('resize', updateMoreTabs);
  moreTabs?.addEventListener('click', () => tabStrip.scrollBy({left:tabStrip.clientWidth * .7, behavior:'smooth'}));
  const activateTab = () => {
    const showCourses = location.hash === '#courses';
    const showArticles = location.hash === '#articles' && !!articles;
    const showAccommodation = location.hash === '#accommodation' && !!accommodation;
    if (overview) overview.hidden = showCourses || showArticles || showAccommodation;
    if (courses) courses.hidden = !showCourses;
    if (articles) articles.hidden = !showArticles;
    if (accommodation) accommodation.hidden = !showAccommodation;
    document.querySelectorAll('.combined-tabs a').forEach(link => {
      const active = link.hash === (showCourses ? '#courses' : showArticles ? '#articles' : showAccommodation ? '#accommodation' : '#overview');
      link.classList.toggle('active', active);
      if (active) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
      if (active && ['#overview', '#courses', '#articles', '#accommodation'].includes(location.hash) && tabStrip) {
        link.scrollIntoView({block:'nearest', inline:'nearest'});
      }
    });
    updateMoreTabs();
    if (window.AOS) window.AOS.refresh();
  };
  activateTab();
  requestAnimationFrame(updateMoreTabs);
  window.addEventListener('hashchange', activateTab);
  const courseSearch = document.getElementById('course-search');
  courseSearch?.addEventListener('input', () => {
    const terms = courseSearch.value.toLowerCase().trim().split(/\s+/).filter(Boolean);
    let count = 0;
    document.querySelectorAll('.course-card').forEach(card => {
      card.hidden = !terms.every(term => card.dataset.courseSearch.includes(term));
      if (!card.hidden) count++;
    });
    document.querySelector('.course-result-count').textContent = `${count} courses`;
    document.querySelector('.course-empty').hidden = count > 0;
  });

  const safeHttpsUrl = value => {
    try {
      const url = new URL(value);
      return url.protocol === 'https:' ? url.href : '';
    } catch { return ''; }
  };
  const loadAccommodationPhoto = async container => {
    if (container.dataset.loaded) return;
    container.dataset.loaded = 'loading';
    const query = new URLSearchParams({
      university: container.dataset.university || '',
      property: container.dataset.propertyIndex || ''
    });
    try {
      const response = await fetch(`/api/accommodation-photo.php?${query}`, {headers:{Accept:'application/json'}});
      if (!response.ok) throw new Error('Photo unavailable');
      const data = await response.json();
      const imageUrl = safeHttpsUrl(data.imageUrl);
      const sourceUrl = safeHttpsUrl(data.sourceUrl);
      if (!imageUrl || !sourceUrl) throw new Error('Invalid photo response');
      const image = document.createElement('img');
      image.src = imageUrl;
      image.alt = typeof data.alt === 'string' ? data.alt : 'Accommodation property photo';
      image.loading = 'lazy';
      image.decoding = 'async';
      const credit = document.createElement('div');
      credit.className = 'accommodation-photo-credit';
      const author = Array.isArray(data.authors) && data.authors[0] && typeof data.authors[0].name === 'string' ? data.authors[0] : null;
      if (author) {
        credit.append('Photo by ');
        const authorUrl = safeHttpsUrl(author.url);
        if (authorUrl) {
          const link = document.createElement('a');
          link.href = authorUrl;
          link.target = '_blank';
          link.rel = 'noopener noreferrer';
          link.textContent = author.name;
          credit.append(link);
        } else credit.append(author.name);
        credit.append(' · ');
      }
      const source = document.createElement('a');
      source.href = sourceUrl;
      source.target = '_blank';
      source.rel = 'noopener noreferrer';
      source.textContent = 'Google Maps';
      credit.append(source);
      container.replaceChildren(image, credit);
      container.dataset.loaded = 'true';
    } catch {
      container.dataset.loaded = 'unavailable';
      const label = container.querySelector('.accommodation-photo-placeholder span');
      if (label) label.textContent = 'Photo unavailable';
    }
  };
  const photoContainers = document.querySelectorAll('[data-accommodation-photo]');
  if ('IntersectionObserver' in window) {
    const photoObserver = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      photoObserver.unobserve(entry.target);
      loadAccommodationPhoto(entry.target);
    }), {rootMargin:'240px'});
    photoContainers.forEach(container => photoObserver.observe(container));
  } else photoContainers.forEach(loadAccommodationPhoto);

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
