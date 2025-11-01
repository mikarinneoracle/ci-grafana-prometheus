## Container Instances Prometheus - Grafana -setup with node-exporter, a Java Spring Boot app and OCI Logging

<ul>
<li>Node exporter for the OCI container instance metrics</li>
<li>Spring Boot Java exporter for app metrics</li>
<li>Logs are exported to OCI Logging with a custom sidecar</li>
<li>Custom sidecar also pulls configs in 30s intervals from a Object Storage private bucket for easy config changes</li>
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

## Create object storage bucket with Prometheus and Grafana configs

Bucket name: <code>prometheus-grafana</code> (default, can be changed when deploying the Stack)
<p>
Directories in the bucket:
<pre>
├── grafana/
│   └── provisioning/
│       ├── dashboards/
│       └── datasources/
└── prometheus/
</pre>
Upload files from <code>object-storage</code> to the directory structure above in the bucket.
<p>
<b>Note!</b> Remember to change the <code>username</code> and <code>password</code> in <code>grafana.ini</code> before uploading!

## Deploy the Container Instances with the Terraform Stack

Deploy the Container Instances stack with OCI Resource Manager (Terraform). First clone this repo to localhost and drag-drop the terraform folder to OCI Resource Manager to create a new Stack. Then configure the stack and apply.
