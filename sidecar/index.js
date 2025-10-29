const identity = require("oci-identity");
const common = require("oci-common");
const objectstorage = require("oci-objectstorage");
const tailfile = require('@logdna/tail-file')
const loggingingestion = require("oci-loggingingestion");

const fs = require("fs");

async function start() {
    const config_file = process.env.config_file;
    console.log("FILE:" + config_file);
    const config_path = process.env.config_path;
    console.log("PATH:" + config_path);
    const bucket = process.env.config_bucket;
    console.log("BUCKET:" + bucket);
    const log_ocid = process.env.log_ocid;
    console.log("OCI LOG:" + log_ocid);
    const log_file = process.env.log_file;
    console.log("LOG FILE:" + log_file);

    //const provider = new common.ConfigFileAuthenticationDetailsProvider("~/.oci/config");
    const provider = common.ResourcePrincipalAuthenticationDetailsProvider.builder();

    const osClient = new objectstorage.ObjectStorageClient({ authenticationDetailsProvider: provider });
    const logClient = new loggingingestion.LoggingClient({ authenticationDetailsProvider: provider });

    const nsRequest = {};
    const nsResponse = await osClient.getNamespace(nsRequest);
    const namespace = nsResponse.value;

    mountConfig(osClient, namespace, bucket, config_path, config_file);
    startTail(log_file);
    
    async function startTail(log_file)
    {
      const tail = new tailfile(log_file, {encoding: 'utf8'})
      .on('data', (chunk) => {
        console.log(`${chunk}`)
        writeLog(logClient, log_ocid, "Sidecar logs", "Sidecar logs", `${chunk}`)
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
            console.log("Trying again " + log_file + " ..");
            startTail(log_file);
        }, 5000);
      });
    }

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
            console.log("Reloading config ..");
            mountConfig(osClient, namespace, bucket, config_path, config_file);
       }, 30000);
    }
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