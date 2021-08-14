include frontend/Makefile
default: back; front
server:
	sudo service postgresql start
back:
	./gradlew bootRun -Pargs="--only-back-end"
front:
	cd "$(PWD)/frontend" && make front