include frontend/Makefile
default: back front
back:
	sudo service postgresql start
	./gradlew bootRun -Pargs="--only-back-end"
front:
	cd "$(PWD)/frontend" && make front
