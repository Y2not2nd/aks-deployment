
# 📦 Project Folder Structure

All project files, configs, and scripts can be found here:  
👉 [GitHub Repo](https://github.com/Y2not2nd/aks-deployment)

```
aks-k8s-project/
├── .gitignore
├── argocd-app.yaml
├── README.md
├── terraform/
│   ├── main.tf
│   ├── variables.tf
│   ├── outputs.tf
│   └── modules/
│       └── aks/
│           ├── main.tf
│           ├── variables.tf
│           └── outputs.tf
├── static-web/
│   ├── Chart.yaml
│   ├── values.yaml
│   └── templates/
│       ├── deployment.yaml
│       ├── service.yaml
│       └── serviceaccount.yaml
├── website/
│   ├── index.html
│   ├── Dockerfile
├── vault-policies/
│   ├── static-web-policy.hcl
│   └── create-policy.sh
└── vault-init.json (⚠ should NOT be committed)
```

**Important:** Add a `.gitignore` at the root before any commits:

```
.terraform/
*.tfstate
*.tfstate.backup
*.tfvars
vault-init.json
```

This prevents accidental commits of large binaries or sensitive files.

---

# 🌟 **Project Overview**

This guide walks you through setting up an end-to-end DevOps pipeline using:

- **Terraform** (infrastructure as code)
- **Azure AKS** (Kubernetes)
- **Docker** (containerization)
- **Helm** (app deployment)
- **Vault** (secret management)
- **ArgoCD** (GitOps delivery)
- **Prometheus + Grafana** (monitoring)
- **Azure Monitor** (cloud observability)
- **Snyk** (security scanning)

✅ **Where to run commands**: Specific folders and terminal instructions will be provided.  
✅ **Before starting**: Install Docker, Terraform, Azure CLI, Helm, kubectl, Git, and VS Code (with Terraform, Kubernetes, Azure extensions).

---

# 🏗 **Step 1: Provision Infrastructure with Terraform**

**Why**: Automate Azure resource creation.

**Folder**: `terraform/`

```bash
terraform init
terraform plan -var="resource_group=aks-rg" -var="location=uksouth" -var="cluster_name=myaks" -var="dns_prefix=myaksdns" -var="node_count=2"
terraform apply -auto-approve -var="resource_group=aks-rg" -var="location=uksouth" -var="cluster_name=myaks" -var="dns_prefix=myaksdns" -var="node_count=2"
az aks get-credentials --resource-group aks-rg --name myaks --overwrite-cli
kubectl get nodes
```

⚠ **Do not commit `.terraform/` files** — clean with Git tools if already committed.

---

# 🐳 **Step 2: Build and Test Docker Image**

**Why**: Package the app into a portable container.

**Folder**: `website/`

```bash
docker build -t static-web:v1 .
docker run -d -p 8080:8080 static-web:v1
```

✅ Test in browser: [http://localhost:8080](http://localhost:8080)  
⚠ Use non-root port (8080) for security.

---

# 🚀 **Step 3: Push Image to Azure Container Registry (ACR)**

**Why**: Store container images in the cloud.

**Folder**: `aks-k8s-project/`

```bash
az acr create -n myacrname -g aks-rg --sku Basic
az acr login -n myacrname
docker tag static-web:v1 myacrname.azurecr.io/static-web:v1
docker push myacrname.azurecr.io/static-web:v1
```

✅ Confirm in Azure Portal → ACR → Repositories.

---

# 📦 **Step 4: Deploy App to AKS with Helm**

**Why**: Simplify Kubernetes deployments.

**Folder**: `static-web/`

```bash
helm create static-web
```

Edit `values.yaml`:

- `image.repository`: `myacrname.azurecr.io/static-web:v1`
- `service.port`: `80`
- `containerPort`: `8080`

```bash
helm upgrade --install static-web ./static-web --namespace default
kubectl get svc static-web
```

✅ Test in browser: `http://<EXTERNAL-IP>`  
⚠ Ensure readiness/liveness probes and resource limits are set.

---

# 🔐 **Step 5: Integrate Vault for Secret Management**

**Why**: Securely store and deliver secrets.

**Folder**: `aks-k8s-project/`

```bash
helm repo add hashicorp https://helm.releases.hashicorp.com
helm install vault hashicorp/vault --set server.ha.enabled=true --set server.ha.raft.enabled=true --set server.dev.enabled=false
kubectl exec -it vault-0 -- vault operator init -key-shares=1 -key-threshold=1 -format=json > vault-init.json
kubectl exec -it vault-0 -- vault operator unseal <UNSEAL_KEY>
kubectl exec -it vault-0 -- vault login <ROOT_TOKEN>
./vault-policies/create-policy.sh
kubectl exec -it vault-0 -- vault status
```

⚠ Avoid Windows file path issues — use heredoc scripts if needed.

---

# 🌊 **Step 6: Set Up ArgoCD for GitOps**

**Why**: Keep Kubernetes synced to Git for automated deployments.

**Folder**: `aks-k8s-project/`

```bash
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
kubectl port-forward svc/argocd-server -n argocd 8080:443
```

✅ Access ArgoCD UI: [https://localhost:8080](https://localhost:8080)  
✅ Login with admin password.

```bash
kubectl apply -n argocd -f argocd-app.yaml
```

✅ Watch auto-sync and deployments.

---

# 📊 **Step 7: Set Up Monitoring**

**Why**: Gain real-time insights.

**Folder**: `aks-k8s-project/`

```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm install kube-prometheus-stack prometheus-community/kube-prometheus-stack --namespace monitoring --create-namespace
kubectl port-forward svc/kube-prometheus-stack-grafana -n monitoring 3000:80
```

✅ Access Grafana: [http://localhost:3000](http://localhost:3000) (get password from secret)

```bash
az aks enable-addons --addons monitoring --name myaks --resource-group aks-rg
```

✅ Check AKS Insights in Azure Portal.

---

# 🔍 **Step 8: Scan Docker Image with Snyk**

**Why**: Identify vulnerabilities.

**Folder**: `aks-k8s-project/`

```bash
npm install -g snyk
snyk auth
snyk test --docker static-web:v1
```

✅ Review results and apply recommended fixes.

---

# 🛠 **Final Git Cleanup (If Needed)**

✅ Add `.gitignore` early.  
✅ To clean history if sensitive/large files were committed:

```bash
git filter-repo --force --path .terraform --invert-paths
java -jar bfg.jar --delete-files vault-init.json --no-blob-protection .
java -jar bfg.jar --strip-blobs-bigger-than 100M --no-blob-protection .
git reflog expire --expire=now --all
git gc --prune=now --aggressive
git push --force --set-upstream origin main
```

✅ Rotate any leaked Vault tokens.

---

# 🚀 **Final Project Achievements**

- ✅ Created cloud infrastructure using Terraform
- ✅ Built and deployed Dockerized app with Helm
- ✅ Managed secrets securely with Vault
- ✅ Automated app delivery with ArgoCD GitOps
- ✅ Implemented multi-layer monitoring with Prometheus, Grafana, Azure Monitor
- ✅ Conducted security scanning with Snyk

👉 **Next (optional)**: Build Jenkins pipelines to automate redeployments.
