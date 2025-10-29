const identity = require("oci-identity");
const common = require("oci-common");
const objectstorage = require("oci-objectstorage");
const fs = require("fs");

async function start() {
    const config_file = process.env.config_file;
    console.log("FILE:" + config_file);
    const config_path = process.env.config_path;
    console.log("PATH:" + config_path);
    const bucket = process.env.config_bucket;
    console.log("BUCKET:" + bucket);

    //const provider = new common.ConfigFileAuthenticationDetailsProvider("config");
    const provider = common.ResourcePrincipalAuthenticationDetailsProvider.builder();

    const osClient = new objectstorage.ObjectStorageClient({ authenticationDetailsProvider: provider });

    const nsRequest = {};
    const nsResponse = await osClient.getNamespace(nsRequest);
    const namespace = nsResponse.value;

    mountConfig(osClient, namespace, bucket, config_path, config_file);

    async function mountConfig(osClient, namespace, bucket, config_path, config_file)
    {
       const getObjectRequest = {
                namespaceName: namespace,
                bucketName: bucket,
                objectName: config_file
       };
       const getObjectResponse = await osClient.getObject(getObjectRequest);
       var chunks = [];
       for await (let chunk of getObjectResponse.value) {
            chunks.push(chunk);
       };
       var buffer = Buffer.concat(chunks);
       console.log(buffer.toString());
       var fileName = config_path + "/" + config_file;
       console.log("Config to: " + fileName);
       await fs.writeFile(fileName, buffer, null, (err) => {
           if (err) {
              console.log('Error writing file:', err);
              return;
           }
           console.log('File written successfully to' + fileName);
       });
       setTimeout(function() {
            mountConfig(osClient, namespace, bucket, config_path, config_file);
       }, 30000);
    }
}

start();