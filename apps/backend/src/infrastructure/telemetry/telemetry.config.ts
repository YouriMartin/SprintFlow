import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';

export const initTelemetry = () => {
  const exporterOptions = {
    url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318/v1/traces',
  };

  const traceExporter = new OTLPTraceExporter(exporterOptions);

  const sdk = new NodeSDK({
    traceExporter,
    instrumentations: [getNodeAutoInstrumentations()],
    serviceName: process.env.OTEL_SERVICE_NAME || 'sprintflow-backend',
  });

  sdk.start();

  process.on('SIGTERM', () => {
    sdk
      .shutdown()
      .then(() => console.log('Telemetry terminated'))
      .catch((error) => console.log('Error terminating telemetry', error))
      .finally(() => process.exit(0));
  });

  return sdk;
};
