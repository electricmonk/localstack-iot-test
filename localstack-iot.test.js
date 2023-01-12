const { CreateThingCommand, CreateKeysAndCertificateCommand, AttachThingPrincipalCommand, IoTClient } = require('@aws-sdk/client-iot');
const { io, iot, iotshadow, mqtt } = require('aws-iot-device-sdk-v2');

const localstackHost = process.env.LOCALSTACK_HOST || 'localhost';
const awsEndpoint = process.env.AWS_ENDPOINT || 'http://localhost:4566';

test("create a thing and connect to it via mqtt", async () => {
  const config = {
    endpoint: awsEndpoint,
    region: 'us-east-1',
    credentials: {
      accessKeyId: 'foo',
      secretAccessKey: 'bar',
    }
  };

  const ioTClient = new IoTClient(config);

  const thingName = 'aThing' + Math.random();
  const createThingCommand = new CreateThingCommand({
    thingName,
    thingTypeName: 'test'
  });
  await ioTClient.send(createThingCommand);

  const keysAndCerts = await ioTClient.send(new CreateKeysAndCertificateCommand({
    setAsActive: true
  }));

  const attachCertificateCommand = new AttachThingPrincipalCommand({
    principal: keysAndCerts.certificateArn,
    thingName: thingName,
  });

  await ioTClient.send(attachCertificateCommand);

  const connCfg = iot.AwsIotMqttConnectionConfigBuilder
    .new_mtls_builder(keysAndCerts.certificatePem, keysAndCerts.keyPair.privateKey)
    .with_endpoint(localstackHost)
    .with_port(4566)
    .with_client_id(thingName)
    .build();
  const client = new mqtt.MqttClient();
  const iotConnection = client.new_connection(connCfg);
  await iotConnection.connect();
}, 30 * 1000);