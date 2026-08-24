import { readdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const websiteDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const postsDir = path.resolve(websiteDir, '..', 'posts')
const outputFile = path.resolve(websiteDir, 'src', 'content.json')

const slugify = (value) => value
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/(^-|-$)/g, '')

const titleFromMarkdown = (markdown, fallback) => {
  const match = markdown.match(/^#\s+(.+)$/m)
  return match ? match[1].trim() : fallback
}

const excerptFromMarkdown = (markdown) => markdown
  .replace(/^#\s+.+$/m, '')
  .replace(/^##\s+.+$/gm, '')
  .replace(/[`*_>#-]/g, '')
  .replace(/https?:\/\/\S+/g, '')
  .replace(/\s+/g, ' ')
  .trim()
  .slice(0, 180)
  .replace(/\s+\S*$/, '') + '…'

const categories = (await readdir(postsDir, { withFileTypes: true }))
  .filter((entry) => entry.isDirectory())
  .sort((a, b) => a.name.localeCompare(b.name))

const content = []
for (const category of categories) {
  const files = (await readdir(path.join(postsDir, category.name)))
    .filter((file) => file.toLowerCase().endsWith('.md'))
    .sort((a, b) => a.localeCompare(b))

  for (const file of files) {
    const markdown = await readFile(path.join(postsDir, category.name, file), 'utf8')
    const filename = file.replace(/\.md$/i, '')
    content.push({
      id: `${category.name}/${filename}`,
      slug: slugify(`${category.name}-${filename}`),
      category: category.name,
      title: titleFromMarkdown(markdown, filename.replace(/[_-]+/g, ' ')),
      excerpt: excerptFromMarkdown(markdown),
      markdown,
    })
  }
}

await writeFile(outputFile, `${JSON.stringify({ generatedAt: new Date().toISOString(), posts: content }, null, 2)}\n`)
console.log(`Generated ${content.length} posts from ${categories.length} categories.`)


