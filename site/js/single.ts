import {
  addClass,
  delClass,
  getArticle,
  queryById,
  versionLoad,
} from './common/common.ts';
import {darkLoad} from './common/dark.ts';

versionLoad();
darkLoad();

addEventListener('load', () => {
  const visibleElementsByLevel = new Map<number, Set<HTMLElement>>();

  const titleObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const target: HTMLElement = entry.target as any;
      const className = entry.target.className;
      const level = /s\d+/.test(className) ? parseInt(className.substr(1)) : 0;

      let visibleElements = visibleElementsByLevel.get(level);
      if (visibleElements == null) {
        visibleElements = new Set();
        visibleElementsByLevel.set(level, visibleElements);
      }
      if (entry.isIntersecting) {
        visibleElements.add(target);
      } else {
        visibleElements.delete(target);
        delClass(queryById(target.dataset.id as string), 'current');
      }
    });

    let maxLevel = 0;
    visibleElementsByLevel.forEach((visibleElements, level) => {
      if (visibleElements.size > 0 && level > maxLevel) {
        maxLevel = level;
      }
    });

    visibleElementsByLevel.forEach((visibleElements, level) =>
      visibleElements.forEach((element) => {
        const target = queryById(element.dataset.id as string);
        if (level == maxLevel) {
          addClass(target, 'current');
        } else {
          delClass(target, 'current');
        }
      }),
    );
  });

  getArticle()
    .querySelectorAll('section[data-id]')
    .forEach((title) => titleObserver.observe(title));
});
