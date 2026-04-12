import {existsSync, readFileSync, readdirSync, writeFileSync} from 'fs';
import {join, relative, resolve} from 'path';

const UTF8 = 'utf-8';
const DOC_SHOT_DIR = 'shots';
const DOC_SHOT_REFS = /\/shots\/[^\s)"']+/g;
const DOC_SHOT_OUTPUT_PATHS = ['.html', '.json', '.md'];

const escapeRegExp = (value: string): string =>
  value.replaceAll(/[.*+?^${}()|[\]\\]/g, '\\$&');

const forEachDeepFile = (
  dir: string,
  callback: (filePath: string) => void,
  extension = '',
): void =>
  readdirSync(dir, {withFileTypes: true}).forEach((entry) => {
    const path = resolve(join(dir, entry.name));
    if (entry.isDirectory()) {
      forEachDeepFile(path, callback, extension);
    } else if (extension == '' || path.endsWith(extension)) {
      callback(path);
    }
  });

const getDocShotRefs = (outDir: string): string[] => {
  const shotDir = join(outDir, DOC_SHOT_DIR);
  if (!existsSync(shotDir)) {
    return [];
  }
  const refs: string[] = [];
  forEachDeepFile(shotDir, (filePath) => {
    refs.push(relative(shotDir, filePath).replaceAll('\\', '/'));
  });
  return refs.sort((a, b) => b.length - a.length);
};

const rewritePublishedDocShots = (outDir: string): void => {
  const refs = getDocShotRefs(outDir);
  DOC_SHOT_OUTPUT_PATHS.forEach((extension) =>
    forEachDeepFile(outDir, (filePath) => {
      const file = readFileSync(filePath, UTF8);
      const rewritten = refs.reduce((file, ref) => {
        const publishedRef = `/${DOC_SHOT_DIR}/${ref}`;
        return file
          .replaceAll(
            new RegExp(`(?<!/${DOC_SHOT_DIR}/)/${escapeRegExp(ref)}`, 'g'),
            publishedRef,
          )
          .replaceAll(
            new RegExp(`(?<![/\\w-])${escapeRegExp(ref)}`, 'g'),
            publishedRef,
          );
      }, file);
      if (rewritten != file) {
        writeFileSync(filePath, rewritten, UTF8);
      }
    }, extension),
  );
};

const getPublishedDocShotRefs = (outDir: string): Map<string, string[]> => {
  const refs = new Map<string, string[]>();
  DOC_SHOT_OUTPUT_PATHS.forEach((extension) =>
    forEachDeepFile(outDir, (filePath) => {
      const matches = readFileSync(filePath, UTF8).match(DOC_SHOT_REFS) ?? [];
      matches.forEach((ref) => {
        const files = refs.get(ref) ?? [];
        files.push(filePath);
        refs.set(ref, files);
      });
    }, extension),
  );
  return refs;
};

export const rewriteAndValidatePublishedDocShots = (outDir: string): void => {
  rewritePublishedDocShots(outDir);
  const missing = [...getPublishedDocShotRefs(outDir).entries()].filter(
    ([ref]) => !existsSync(join(outDir, ref)),
  );
  if (missing.length > 0) {
    throw new Error(
      missing
        .map(
          ([ref, files]) =>
            `Missing doc shot ${ref} referenced from ${files.join(', ')}`,
        )
        .join('\n'),
    );
  }
};
