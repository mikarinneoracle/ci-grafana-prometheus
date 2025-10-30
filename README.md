# Container Instances Prometheus setup with node-exporter, a Spring Boot app and OCI Logging

<ul>
<li>Spring Boot apps contains Prometheus Java exporter</li>
<li>Logs are exported to OCI Logging with a custom sidecar</li>
<li>Custom sidecar also pulls Prometheus config in 30s intervals from a Object Storage private bucket</li>
</ul>

## Build containers

Build containers with GitHub Actions <code>containers.yml</code>pipeline
<p>
    
This requires three secrets:
<pre>
DOCKER_USERNAME
AUTH_TOKEN
TENANCY_NAMESPACE
</pre>

It uses <code>FRA</code> region for OCIR, i.e. Registry is <code>fra.ocir.io</code>

## Deploy the Container Instances with the Terraform Stack

Deploy the Container Instances stack with OCI Resource Manager (Terraform). First clone this repo to localhost and drag-drop the terraform folder to OCI Resource Manager to create a new Stack. Then configure the stack and apply.
