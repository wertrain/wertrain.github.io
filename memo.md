# Git Commands

## Add user info

### Name
    git config user.name "(your_name)"
### E-Mail
    git config user.email "(your_email@example.com)"

# Node.js

## Install plugin (save exact version)
    npm install --save --save-exact (package-name)
	
## Setting default
    npm config set save=true
    npm config set save-exact=true	

# Heroku

## Specify the version of node
    node --version
    npm --version
pacakge.json

    "engine": {
      "node": "v5.0.0",
      "npm": "3.3.6"
    },

## Add remote
    git remote add heroku git@heroku.com:(app-name).git
	
## package.json Sample
	{
		"name": "(package-name)",
		"version": "1.0.0",
		"private": true,
		"scripts": {
			"start": "node server/server.js"
		},
		"engine": {
			"node": "v5.0.0",
			"npm": "3.3.6"
		},
		"description": "",
		"dependencies": {
			"express": "4.13.3",
			"gulp": "3.9.0",
			"gulp-concat": "2.6.0",
			"gulp-uglify": "1.5.1",
			"socket.io": "1.3.7"
		},
		"devDependencies": {}
	}

## Push a branch other than the master
    git push heroku (branch-name):master

