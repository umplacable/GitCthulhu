const fetch = require('node-fetch');

async function publishRelease(tag, filePath, token) {
  const res = await fetch('https://gitea.example.com/api/v1/repos/user/repo/releases', {
    method: 'POST',
    headers: {
      'Authorization': `token ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      tag_name: tag,
      name: tag,
      body: 'Release automatique',
      draft: false,
      prerelease: false
    })
  });

  const release = await res.json();
  console.log(release);

  // Upload des fichiers avec l’API
  // ...
}
