import * as fs from 'fs';
import marked from 'marked';

const createRootFile = () => {
  const rootContent: string = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta http-equiv="x-ua-compatible" content="ie=edge">
    <title>Blog Post List</title>
    <meta name="description" content="">
    <meta name="viewport" content="width=device-width, initial-scale=1">
  </head>
  <body>
    <p><strong>Blog Post Archive</strong> - Sorted by newest first</p>
    [[posts]]
  </body>
</html>`;
  const inputDir: string = './blog/posts';
  const postFilePaths: string[] = fs.readdirSync(inputDir).sort().reverse();
  const postLinkDom: string[] = postFilePaths.map(path => `<p><a href="./${path}">${path.replace('.html', '')}</a></a></p>`);
  const rootHtml: string = rootContent.replace('[[posts]]', postLinkDom.join(''));
  fs.writeFileSync(`${inputDir}/index.html`, rootHtml);
}

(async () => {
  const inputDir: string = './blog/raw';
  const outputDir: string = './blog/posts';
  const template: string = fs.readFileSync('./blog/template/template.html').toString();

  fs.mkdirSync(outputDir, {recursive: true});
  const rawFilePaths: string[] = fs.readdirSync(inputDir);

  rawFilePaths.forEach((file: string) => {
    const fileContent: string = fs.readFileSync(`${inputDir}/${file}`).toString();
    let fileContentHtml: string = marked(fileContent, {
      headerIds: false
    });
    fileContentHtml = fileContentHtml.replace(/<\/h[1-6]>/, (s => `${s}<br/>`)).replace(/<\/p>/g, '</p><br/>');
    const post: string = template.replace('[[content]]', fileContentHtml);
    const htmlFileName: string = file.replace('.md', '.html');
    fs.writeFileSync(`./blog/posts/${htmlFileName}`, post);
  });

  createRootFile();
})();
