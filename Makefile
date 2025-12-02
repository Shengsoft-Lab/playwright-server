.PHONY: clean dev prod

default: dev

clean:
	find . -name '.DS_Store' -print0 | xargs -0 rm -rf

dev:
	DEBUG=debug:* npm run dev

prod:
	pm2 start ecosystem.config.js

test:
	npm test

