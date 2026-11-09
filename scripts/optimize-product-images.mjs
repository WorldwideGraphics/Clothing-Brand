import { copyFile, mkdir, readdir, readFile, rm, rmdir, stat, unlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const imageRoot = path.join(root, 'public', 'images', 'products');
const sourceRoots = [path.join(root, 'src'), path.join(root, 'scripts')];
const textExtensions = new Set(['.astro', '.css', '.js', '.json', '.mjs', '.ts']);
const imageExtensions = new Set(['.jpg', '.jpeg', '.png']);
const concurrency = 4;
const progressInterval = 500;
const lockRetryCount = 12;

async function retryOnFileLock(task, description) {
  for (let attempt = 0; ; attempt++) {
    try {
      return await task();
    } catch (error) {
      if (!['EBUSY', 'EACCES', 'EPERM'].includes(error.code) || attempt >= lockRetryCount) {
        throw new Error(`${description}: ${error.message}`, { cause: error });
      }
      await new Promise(resolve => setTimeout(resolve, Math.min(250 * 2 ** attempt, 5000)));
    }
  }
}

async function listFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(entry => {
    const entryPath = path.join(directory, entry.name);
    return entry.isDirectory() ? listFiles(entryPath) : [entryPath];
  }));
  return nested.flat();
}

async function mapWithConcurrency(items, task, workerCount) {
  let nextIndex = 0;
  let firstError;
  const workers = Array.from({ length: Math.min(workerCount, items.length) }, async () => {
    while (true) {
      if (firstError) return;
      const index = nextIndex++;
      if (index >= items.length) return;
      try {
        await task(items[index], index);
      } catch (error) {
        firstError ||= error;
      }
    }
  });
  await Promise.all(workers);
  if (firstError) throw firstError;
}

function webpPath(filePath) {
  return `${filePath.slice(0, -path.extname(filePath).length)}.webp`;
}

async function replaceSourceReferences(stagingRoot, stagedFiles) {
  const sourceFiles = (await Promise.all(sourceRoots.map(listFiles))).flat()
    .filter(filePath => textExtensions.has(path.extname(filePath).toLowerCase()));
  const imageReference = /\/images\/products\/[^"'\\\s?#)]+\.(?:jpe?g|png)(?=[?#"'\\\s)]|$)/gi;

  for (const filePath of sourceFiles) {
    const content = await readFile(filePath, 'utf8');
    const updated = content.replace(imageReference, reference => reference.replace(/\.(?:jpe?g|png)$/i, '.webp'));
    if (updated === content) continue;

    const temporaryPath = path.join(stagingRoot, `source-${path.basename(filePath)}-${sourceFiles.indexOf(filePath)}.tmp`);
    stagedFiles.add(temporaryPath);
    await writeFile(temporaryPath, updated, 'utf8');
    await retryOnFileLock(() => copyFile(temporaryPath, filePath), `Could not update ${path.relative(root, filePath)}`);
    await retryOnFileLock(() => unlink(temporaryPath), `Could not clean up ${path.basename(temporaryPath)}`);
    stagedFiles.delete(temporaryPath);
  }

  const references = [];
  for (const filePath of sourceFiles) {
    const content = await readFile(filePath, 'utf8');
    for (const match of content.matchAll(/\/images\/products\/[^"'\\\s?#)]+\.webp/g)) {
      references.push({ filePath, reference: match[0] });
    }
  }

  const invalidReferences = [];
  for (const { filePath, reference } of references) {
    const imagePath = path.join(root, 'public', reference.replaceAll('/', path.sep).replace(/^public[\\/]/, ''));
    try {
      const imageStat = await stat(imagePath);
      if (imageStat.size === 0) invalidReferences.push({ filePath, reference });
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
      invalidReferences.push({ filePath, reference });
    }
  }

  if (invalidReferences.length) {
    const sample = invalidReferences.slice(0, 5)
      .map(item => `${path.relative(root, item.filePath)} -> ${item.reference}`)
      .join('\n');
    throw new Error(`${invalidReferences.length} product image references are missing after conversion:\n${sample}`);
  }

  console.log(`Verified ${references.length} product image references.`);
}

async function main() {
  const files = await listFiles(imageRoot);
  const unsupported = files.filter(filePath => !imageExtensions.has(path.extname(filePath).toLowerCase()) &&
    path.extname(filePath).toLowerCase() !== '.webp');
  if (unsupported.length) {
    throw new Error(`Unsupported product image format: ${unsupported[0]}`);
  }

  const sources = files.filter(filePath => imageExtensions.has(path.extname(filePath).toLowerCase()));
  const destinations = new Set();
  for (const source of sources) {
    const destination = webpPath(source);
    if (destinations.has(destination)) {
      throw new Error(`WebP destination already exists: ${path.relative(root, destination)}`);
    }
    destinations.add(destination);
  }

  console.log(`Converting ${sources.length} product images to WebP (quality 88; original dimensions preserved).`);
  const stagingRoot = path.join(tmpdir(), `ahmad-emporium-image-optimization-${process.pid}`);
  await mkdir(stagingRoot, { recursive: true });
  let completed = 0;
  const stagedFiles = new Set();
  try {
    await mapWithConcurrency(sources, async (source, index) => {
      const destination = webpPath(source);
      let destinationExists = true;
      try {
        await stat(destination);
      } catch (error) {
        if (error.code === 'ENOENT') {
          destinationExists = false;
        } else {
          await retryOnFileLock(() => stat(destination), `Could not inspect ${path.relative(root, destination)}`);
        }
      }

      if (destinationExists) {
        const metadata = await retryOnFileLock(() => sharp(destination).metadata(), `Could not verify ${path.relative(root, destination)}`);
        if (metadata.format !== 'webp' || !metadata.width || !metadata.height) {
          throw new Error(`Invalid WebP output: ${path.relative(root, destination)}`);
        }
      } else {
        const stagedPath = path.join(stagingRoot, `${index}.webp`);
        stagedFiles.add(stagedPath);
        try {
          await sharp(source).rotate().webp({ quality: 88, effort: 5 }).toFile(stagedPath);
          const metadata = await sharp(stagedPath).metadata();
          if (metadata.format !== 'webp' || !metadata.width || !metadata.height) {
            throw new Error('Generated file is not a valid WebP image.');
          }
          await retryOnFileLock(() => copyFile(stagedPath, destination), `Could not copy ${path.relative(root, destination)}`);
          await retryOnFileLock(() => unlink(stagedPath), `Could not clean up ${path.basename(stagedPath)}`);
          stagedFiles.delete(stagedPath);
        } catch (conversionError) {
          throw new Error(`Could not convert ${path.relative(root, source)}: ${conversionError.message}`);
        }
      }

      completed++;
      if (completed % progressInterval === 0 || completed === sources.length) {
        console.log(`Converted ${completed}/${sources.length} images.`);
      }
    }, concurrency);

    await replaceSourceReferences(stagingRoot, stagedFiles);

    console.log(`Removing ${sources.length} replaced source images.`);
    let removed = 0;
    await mapWithConcurrency(sources, async source => {
      await retryOnFileLock(() => unlink(source), `Could not remove ${path.relative(root, source)}`);
      removed++;
      if (removed % progressInterval === 0 || removed === sources.length) {
        console.log(`Removed ${removed}/${sources.length} source images.`);
      }
    }, concurrency);

    const finalImages = await listFiles(imageRoot);
    console.log(`Complete: ${finalImages.length} product image files remain.`);
  } finally {
    await mapWithConcurrency([...stagedFiles], filePath =>
      retryOnFileLock(() => rm(filePath, { force: true }), `Could not clean up ${path.basename(filePath)}`), concurrency);
    await rmdir(stagingRoot);
  }
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
