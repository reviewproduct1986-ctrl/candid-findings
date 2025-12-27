const fs = require('fs');
const blogs = require('./public/data/blogs.json');

const routes = [
  '/',
  ...blogs.posts.map(post => `/reviews/${post.slug}`)
];

fs.writeFileSync(
  'routes.txt',
  routes.join('\n')
);

console.log(`Generated ${routes.length} routes`);