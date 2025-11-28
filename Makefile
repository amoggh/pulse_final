SHELL := /bin/sh

.PHONY: up down seed train demo

up:
	docker compose --env-file ./env.example up --build

down:
	docker compose down -v

seed:
	curl -X POST http://localhost:8000/seed

demo: up


