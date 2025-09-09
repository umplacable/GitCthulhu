# GitCthulhu

<div style="
    background-color: #ff48573b;
    color: #ff3815ff;
    border: 1px solid #81001685;
    border-radius: 8px;
    padding: 15px;
    margin: 10px 0;
    font-family: Arial, sans-serif;
">
  <strong>⚠️ Attention !</strong> Le dossier <i><b>dist</b></i> est généré automatiquement au lancement, il est donc inutile de le modifier.
</div>

## Instalation
Pour installer les dépendances de l'app, il faudra d'abort installer NodeJS, sur le site Web : https://nodejs.org/fr/download, pour pouvoir utilier les commandes `npm`. 
Après avoir instaler NodeJS, il va faloir installer les dépendances du projet : 
``` shell
npm install
```

## Lancement de L'application
Pour lancer l'application il faudra lancer la commande : 
``` shell
npm run sass    # ne se terminera pas après le lancement (a laisser allumé pour recompiler les fichiers SCSS)
npm run start   # fera automatiquement le build de l'app et le lancement.

#le mieux est de les exécuter sur deux terminaux différents 
```

## Dévelopement
### Ajout de fenêtres

Pour ajouter une fenêtre, il y a pluxieur étapes a respecter:

1. Créer une fichier HTML comme les autre fenêtres et en ne metant dans le body que la ligne `<div id="root"></div>`. 
2. Dans [`main.js`](main.js), il faut créer une méthode pour créer la fenêtre.
3. Dans le docier [`src`](src), il faut créer 2 fichiers **.jsx** contenant: la fenêtre et les fonctions de la fenêtre, un fichier liant le premier fichier et la page **html**.
4. Dans [`webpack.config.js`](webpack.config.js), il faut ajouter:
* Dans la liste des "entry" : 
``` js
NomDuFichier: "./src/NomDuFichier.jsx"
```
* En plus il faut ajouter dans les plugins : 
``` js
new HtmlWebpackPlugin({
      template: "./public/fichierHTML.html",
      filename: "fichierHTML.html",
      chunks: ["NomDuFichier"], // nom de l'entry associer
    }),
```