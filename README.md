###Deploy React using Github Pages

##Steps 1
Add homepage property to package.json
`"homepage": "https://{github-user-name}.github.io/...}",`

##Step 2 A
`npm install gh-pages`
or 
`yarn add gh-pages`

##Step 2 B
Add predeploy and deploy script to scripts section of package.json
`"predeploy": "npm run build",`
`"deploy": "gh-pages -d build",`

##Step 3 
Deploy the application

`npm run deploy`
or 
`yarn run deploy`
