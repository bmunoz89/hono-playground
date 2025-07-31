build:
	docker build -t bmunoz89/hono-playground:1.0.0 .
	docker image push bmunoz89/hono-playground:1.0.0

rebuild:
	docker image rm bmunoz89/hono-playground:1.0.0
	docker build --target prod -t bmunoz89/hono-playground:1.0.0 .
	docker image push bmunoz89/hono-playground:1.0.0

namespace-create:
	kubectl create namespace hono-playground

install:
	helm install hono-playground ./helm-chart -n hono-playground

upgrade:
	helm upgrade hono-playground ./helm-chart -n hono-playground

uninstall:
	helm uninstall hono-playground -n hono-playground

pods:
	kubectl get pods -n hono-playground

pods-describe:
	kubectl describe pods -n hono-playground

config:
	kubectl get configmaps -n hono-playground

config-describe:
	kubectl describe configmaps -n hono-playground hono-playground-hono-playground-configmap

pods-delete:
	kubectl delete pod -l app=hp-app -n hono-playground

deployments:
	kubectl get deployments -n hono-playground

services:
	kubectl get svc -n hono-playground

logs:
	kubectl logs -n hono-playground -l app=hp-app -f --prefix --all-containers --ignore-errors

logs-redis:
	kubectl logs -n hono-playground services/hono-playground-redis-headless -f --prefix --all-containers --ignore-errors