const fs = require('fs');
const path = require('path');

if (process.argv.length < 5) {
  console.log('You will need to specify a Post.News archive file, profile, and a target folder.');
  return 0;
}

const emoji = {
  thumbs_up: '👍',
}
const outFolder = process.argv[4];
const json = fs.readFileSync(process.argv[2]);
const posts = JSON.parse(json);
const index = [];
const topics = {};
const htmlProlog = '<!DOCTYPE html><head><meta charset="utf-8">' +
  '<meta http-equiv="X-UA-Compatible" content="IE=edge">' +
  '<meta name="viewport" content="width=device-width, initial-scale=1">' +
  '<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />' +
  '<meta http-equiv="Pragma" content="no-cache" />' +
  '<meta http-equiv="Expires" content="Thu, 1 Jan 1970 00:00:00 GMT" />' +
  '<link rel="stylesheet" href="assets/post.css" />';
const user = JSON.parse(fs.readFileSync(process.argv[3]));

user.avatarURL = cleanUrl(user.avatarURL, '.png');
user.profileBackgroundImage = cleanUrl(user.profileBackgroundImage, '.png');

const userHtml = '<div class="user">' +
  '<img class="background" src="' + user.profileBackgroundImage + '" />' +
  '<img class="avatar" src="' + user.avatarURL + '" />' +
  '<h1>' + user.displayName + '</h1>' +
  '<p class="title"><i>' + user.title + '</i></p>' +
  '<p class="bio">' + user.bio + '</p>' +
  '<p class="links">' +
  user.externalProfileLinks.map((l) => '<a href="' + l.url + '">' + l.provider + '</a>').join(' ') +
  '</p>' +
  '</div>';

if (!fs.existsSync(outFolder)) {
  fs.mkdirSync(outFolder);
}

posts.forEach((p) => {
  const name = path.join(outFolder, `${p.postId}.html`);
  let body = p.html;

  body = body.replace(/<img src="([^"]+)"/g, (match) => {
    const url = match.split('"')[1];
    return '<img src="' + cleanUrl(url, '.png') + '"';
  });

  const match = body.match(/<h1>(.*?)<\/h1>/);
  const title = match ? match[1] : `${p.content.slice(0,50)}...`;
  const when = new Date(p.dateCreated).toLocaleDateString('en-US', {
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    month: 'long',
    weekday: 'long',
    year: 'numeric',
  });
  let interactionHtml = [];

  for (const [key, value] of Object.entries(p.interactionStats)) {
    if (value > 0) {
      const k = key.replace(/Count$/, '').replace(/([a-z])([A-Z])/g, '$1 $2');
      interactionHtml.push(`<div class="interaction ${key}">${value} ${k}</div>`);
    } else if (key === 'reactions') {
      // Turn the reaction names to their emoji
      const reactions = p.interactionStats.reactions;
      interactionHtml.push(Object.keys(reactions).map((key) => {
        return `<div class="interaction reaction ${key}">${reactEmoji(key)} ${reactions[key]}</div>`
      }).join(', '));
    }
  }

  const html = htmlProlog +
    '<script async defer src="assets/redirect.js"></script>' +
    `<title>${title}</title></head><body>` +
    `<time class="dt-published" datetime="${p.dateCreated}">${when}</time>` +
    `<hr>${body}<p class="tags">` +
    p.topics.map((t) => '<a href="topic-' + t + '.html">#' + t + '</a>').join(', ') +
    '</p><div class="interactions">' + interactionHtml.join('') + '</div>' +
    `<hr><p><a href="index.html">Back to the index&hellip;</a></p>${userHtml}` +
    '</body></html>';

  fs.writeFileSync(name, html);

  for (let i = 0; i < p.topics.length; i++) {
    if (!Object.prototype.hasOwnProperty.call(topics, p.topics[i])) {
      topics[p.topics[i]] = [];
    }

    topics[p.topics[i]].push({ title, name: `${p.postId}.html` });
  }

  index.push(`<li><a href="${p.postId}.html">${title}</a> &mdash; ${when}</li>`);
});

const indexName = path.join(outFolder, 'index.html');
const indexHtml = htmlProlog +
  '<title>Posts</title></head><body>' +
  userHtml + '<hr><ul>' +
  index.join('<br/>') +
  '</ul></body></html>';
fs.writeFileSync(indexName, indexHtml);

Object.keys(topics).forEach((t) => {
  const topicName = path.join(outFolder, 'topic-' + t + '.html');
  const topicHtml = htmlProlog +
    '<title>Posts - ' + t + '</title></head><body>' +
    `<h1>#${t}</h1>` +
    topics[t].map((p) => `<a href="${p.name}">${p.title}</a>`).join('<br/>') +
    '</body></html>';
  fs.writeFileSync(topicName, topicHtml);
});

fs.cpSync(path.join(__dirname, 'images'), path.join(outFolder, 'images'), { recursive: true });
fs.cpSync(path.join(__dirname, 'assets'), path.join(outFolder, 'assets'), { recursive: true });

function cleanUrl(url, ext) {
  return url.replace(/https:\/\/.*\/images\//, 'images/').replace(/\.[^/.]+$/) + ext;
}

function reactEmoji(name) {
  return emoji[name] ? `<span class="emoji" title="${name}">${emoji[name]}</span>` : `:${name}:`;
}