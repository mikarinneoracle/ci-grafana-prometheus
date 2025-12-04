## Container Instances Prometheus - Grafana -setup with node-exporter, a Java Spring Boot app and OCI Logging

<ul>
<li>Node exporter for the OCI container instance metrics</li>
<li>Spring Boot Java exporter for app metrics</li>
<li>Logs are exported to OCI Logging with a custom sidecar. Springboot app log is configured to <code>resources/application.properties</code> as <code>/var/log/app.log</code></li>
<li>Custom sidecar also pulls configs in 30s intervals from a Object Storage private bucket for easy config changes to <code>/etc</code> of Prometheus and Grafana containers' shared volume</li>
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
<p>
    
Subnet ports can be opened for the following access:
<ul>
    <li>8080 for the Springboot app</li>
    <li>3000 for Grafana</li>
    <li>9090 for Prometheus (optional)</li>
</ul>
For taking this to a a quick spin, you can use a VCN with a public subnet to have public access to Grafana.
VCN and subnet creation including the ports above is manual and not included in the Terraform Stack.
Then, git clone this repo and drag&drop the terraform folder to OCI Resource Manager when creating a new Stack.
After this, configure then vars and continue to have the stack deployed.
