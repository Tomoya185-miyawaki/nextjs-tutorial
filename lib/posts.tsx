import { remark } from 'remark'
import html from 'remark-html'
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

type postDataResult = {
  id:string
  content: string
  data: {title:string, date:string}
}

type postData = {
  id: string
  contentHtml: string
  title: string
  date: string
}

const postsDirectory = path.join(process.cwd(), 'posts')

export function getSortedPostsData(): postDataResult {
  const fileNames =  fs.readdirSync(postsDirectory)
  const allPostsData = fileNames.map(fileName => {
    const id = fileName.replace(/\.md$/, '')

    const fullPath = path.join(postsDirectory, fileName)
    const fileContents = fs.readFileSync(fullPath, 'utf8')

    const matterResult = matter(fileContents)
    return {
      id,
      ...matterResult
    }
  })
  return JSON.parse(JSON.stringify(allPostsData.sort((a, b) => {
    if (a.data.date < b.data.date) {
      return 1
    } else {
      return -1
    }
  })))
}

export function getAllPostIds() {
  const fileNames = fs.readdirSync(postsDirectory)

  // Returns an array that looks like this:
  // [
  //   {
  //     params: {
  //       id: 'ssg-ssr'
  //     }
  //   },
  //   {
  //     params: {
  //       id: 'pre-rendering'
  //     }
  //   }
  // ]
  return fileNames.map(fileName => {
    return {
      params: {
        id: fileName.replace(/\.md$/, '')
      }
    }
  })
}

export async function getPostData(id: string): Promise<postData> {
  const fullPath = path.join(postsDirectory, `${id}.md`)
  const fileContents = fs.readFileSync(fullPath, 'utf8')

  // Use gray-matter to parse the post metadata section
  const matterResult = matter(fileContents)

  // Use remark to convert markdown into HTML string
  const processedContent = await remark()
    .use(html)
    .process(matterResult.content)
  const contentHtml = processedContent.toString()
  const title = matterResult.data.title
  const date = matterResult.data.date
  // Combine the data with the id and contentHtml
  return {
    id,
    contentHtml,
    title,
    date
  }
}