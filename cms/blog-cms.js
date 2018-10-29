let fs = require('fs');

// Gather data and page
let cmsData = JSON.parse(fs.readFileSync('blog-cms-test.json', 'utf8'));
let cmsPage = fs.readFileSync('blog-cms.html', 'utf8');

// Process post content into paragraphs from input
cmsData.postContent = '<p>' + cmsData.postContent.replace(/\n/g, '</p><br/><p>') + '</p>';

// Replace title and content
cmsPage = cmsPage.replace(/\${postTitle}/, cmsData.postTitle);
cmsPage = cmsPage.replace(/\${postContent}/, cmsData.postContent);

fs.writeFileSync(cmsData.postFile, cmsPage);
