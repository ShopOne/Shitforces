server:
	sudo service postgresql start;
back:
	./gradlew bootRun -Pargs="--only-back-end";
front:
	cd frontend && PORT=3000 npm start;