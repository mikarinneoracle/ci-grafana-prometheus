const identity = require("oci-identity");
const common = require("oci-common");
const objectstorage = require("oci-objectstorage");
const tailfile = require('@logdna/tail-file')
const loggingingestion = require("oci-loggingingestion");

const fs = require("fs");

async function start() {
    const config_path = process.env.config_path;
    console.log("PATH:" + config_path);
    const bucket = process.env.config_bucket;
    console.log("BUCKET:" + bucket);
    const log_ocid = process.env.log_ocid;
    console.log("OCI LOG:" + log_ocid);
    const log_file = process.env.log_file;
    console.log("LOG FILE:" + log_file);
    const reload_delay = process.env.reload_delay;
    console.log("OS BUCKET CONFIG RELOAD (ms):" + reload_delay);

    //const provider = new common.ConfigFileAuthenticationDetailsProvider("~/.oci/config");
    const provider = common.ResourcePrincipalAuthenticationDetailsProvider.builder();

    const osClient = new objectstorage.ObjectStorageClient({ authenticationDetailsProvider: provider });
    const logClient = new loggingingestion.LoggingClient({ authenticationDetailsProvider: provider });

    const nsRequest = {};
    const nsResponse = await osClient.getNamespace(nsRequest);
    const namespace = nsResponse.value;

    mount(osClient, namespace, bucket, config_path, reload_delay);
    startTail(logClient, log_ocid, log_file);
}

async function mount(osClient, namespace, bucket, path, reloadDelay)
{
 const listObjectsRequest = {
      namespaceName: namespace,
      bucketName:  bucket
 };
 const listObjectsResponse = await osClient.listObjects(listObjectsRequest);
 //console.log(listObjectsResponse.listObjects.objects);
 files = listObjectsResponse.listObjects.objects;
 for(i=0; i < files.length; i++) {
    //console.log(files[i].name);
    await downloadFile(osClient, namespace, bucket, files[i], path);
 }
 if(parseInt(reloadDelay) > 0) {
  setTimeout(function() {
    mount(osClient, namespace, bucket, path, reloadDelay);
  }, parseInt(reloadDelay));   
 } else {
    console.log("No reloading of bucket " + bucket + " since reload delay was " + reloadDelay);
 }
}

async function downloadFile(osClient, namespace, bucket, file, path)
{
   const getObjectRequest = {
            namespaceName: namespace,
            bucketName: bucket,
            objectName: file.name
    };
    const getObjectResponse = await osClient.getObject(getObjectRequest);
    //console.log(getObjectResponse);
    if(getObjectResponse.contentType.indexOf("directory") > 0) {
      console.log(file.name + " is a directory, creating .. ");
      fs.mkdir(path + "/" + file.name, (err) => {
        if (err) console.log(err);
      });
    } else {
     var chunks = [];
     for await (let chunk of getObjectResponse.value) {
         chunks.push(chunk);
     }
     var buffer = Buffer.concat(chunks);
     await fs.writeFile(path + "/" + file.name, buffer, null, (err) => {
       if (err) {
         console.log('Error writing file:', err);
         return;
       }
       console.log('File written successfully to' + path + "/" + file.name);
     });
  } 
}

async function startTail(logClient, log_ocid, log_file)
{
  const tail = new tailfile(log_file, {encoding: 'utf8'})
  .on('data', (chunk) => {
    //console.log(`${chunk}`)
    writeLog(logClient, log_ocid, log_file, log_file, `${chunk}`)
  })
  .on('tail_error', (err) => {
    console.error('TailFile had an error!', err)
  })
  .on('error', (err) => {
    console.error('A TailFile stream error was likely encountered', err)
  })
  .start()
  .catch((err) => {
    console.log("Cannot start.  Does " + log_file + "  exist?")
    setTimeout(function() {
        console.log("Trying again to open " + log_file + " ..");
        startTail(logClient, log_ocid, log_file);
    }, 5000);
  });
}

async function writeLog(logClient, log_ocid, subject, type, data)
{
  try {
        const putLogsDetails = {
          specversion: "1.0",
          logEntryBatches: [
            {
              entries: [
                {
                  id: subject,
                  data: data
                }
              ],
              source: "nginx-logging-sidecar",
              type: type,
              subject: subject
            }
          ]
        };
        var putLogsRequest = loggingingestion.requests.PutLogsRequest = {
          logId: log_ocid,
          putLogsDetails: putLogsDetails,
          timestampOpcAgentProcessing: new Date()
        };
        const putLogsResponse = await logClient.putLogs(putLogsRequest);
        //console.log("Wrote to log succesfully");
  } catch (err) {
    console.error('Log error: ' + err.message);
  }
}

start();