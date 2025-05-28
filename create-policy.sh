#!/bin/bash
kubectl exec -i vault-0 -- sh -c 'cat > /tmp/policy.hcl << EOF
path "kv/data/static-web-secrets" {
  capabilities = ["read"]
}
EOF
vault policy write static-web-policy /tmp/policy.hcl' 