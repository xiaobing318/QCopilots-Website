/**
 * Plays demo scenes one after another while a demo is on screen.
 * Without JavaScript, or with reduced motion, the first scene stays still in its final state.
 */
const sceneMs = 9000;

export function setupDemos() {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  document
    .querySelectorAll<HTMLElement>('figure[data-demo][data-variant="full"]:not([data-ready])')
    .forEach((figure) => {
      figure.dataset.ready = 'true';
      const scenes = [...figure.querySelectorAll<HTMLElement>('[data-scene]')];
      const toggle = figure.querySelector<HTMLButtonElement>('[data-demo-toggle]');
      let index = 0;
      let timer = 0;
      let visible = false;
      let paused = false;

      const show = (next: number) => {
        index = next;
        scenes.forEach((scene, position) => (scene.hidden = position !== next));
      };
      const playing = () => visible && !paused && !reduce.matches;
      const update = () => {
        window.clearTimeout(timer);
        figure.classList.toggle('is-playing', playing());
        if (toggle) toggle.hidden = reduce.matches;
        if (playing() && scenes.length > 1)
          timer = window.setTimeout(() => {
            show((index + 1) % scenes.length);
            update();
          }, sceneMs);
      };

      toggle?.addEventListener('click', () => {
        paused = !paused;
        toggle.setAttribute('aria-pressed', String(paused));
        update();
      });
      reduce.addEventListener('change', () => {
        if (reduce.matches) show(0);
        update();
      });
      new IntersectionObserver(
        ([entry]) => {
          visible = entry.isIntersecting;
          update();
        },
        { threshold: 0.35 },
      ).observe(figure);
      update();
    });
}
