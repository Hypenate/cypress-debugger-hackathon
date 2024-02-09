import { TestExecutionResult } from 'cypress-debugger';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useCypressEventsContext } from '../context/cypressEvents';
import { useHttpArchiveContext } from '../context/httpArchiveEntries';
import { useReplayerContext } from '../context/replayer';
import usePayloadFetcher from '../hooks/usePayloadFetcher';
import { usePayloadQueryParam } from '../hooks/useQuery';
import JsonFileUpload from './JsonFileUpload';

function extractPath(agentPath: string | null) {
  if (!agentPath) {
    return '';
  }

  const parts = agentPath.split('/');

  const libsIndex = parts.indexOf('libs');
  const appsIndex = parts.indexOf('apps');

  const startIndex = libsIndex !== -1 ? libsIndex : appsIndex;

  if (startIndex === -1) {
    return null; // 'libs' or 'apps' not found in the path
  }

  return parts.slice(startIndex).join('/');
}

function PayloadHandler() {
  const [loading, setLoading] = useState(false);

  const { origin, setOrigin, setReplayerData } = useReplayerContext();

  const { setHttpArchiveLog } = useHttpArchiveContext();

  const { setEvents, setMeta, setBrowserLogs } = useCypressEventsContext();

  const [queryParam] = usePayloadQueryParam();

  const validate = (payload: TestExecutionResult) =>
    Object.keys(payload).every((key) =>
      ['id', 'meta', 'cy', 'rr', 'har', 'pluginMeta', 'browserLogs'].includes(
        key
      )
    );

  const handleDataChange = (payload: TestExecutionResult | null) => {
    setEvents(payload?.cy || []);
    setReplayerData(payload?.rr || []);
    setHttpArchiveLog(payload?.har || null);
    const stackTraceEvent = payload?.cy.find(
      (item) => item.payload.err?.parsedStack
    );
    const parsedStack = stackTraceEvent?.payload.err?.parsedStack;
    const absoluteFile: string = parsedStack?.find(
      (item: { absoluteFile: string }) => item.absoluteFile
    ).absoluteFile;

    // /var/vsts/temporary-agent-grizzly-beta-mchj2/1/s/libs/smc/admin-config/connectors/feature-manage-e2e/src/e2e/ui/connectors-form-validation.cy.ts
    // get the part starting from /libs or /apps
    const absoluteFilePath = extractPath(absoluteFile) ?? '';

    setMeta(
      payload?.meta
        ? {
            ...payload.meta,
            absoluteFile: absoluteFilePath,
          }
        : null
    );
    setBrowserLogs(payload?.browserLogs || null);
  };

  const handleFileChange = ({
    filename,
    payload,
  }: {
    filename: string | null;
    payload: TestExecutionResult | null;
  }) => {
    setOrigin(filename);
    handleDataChange(payload);
  };

  usePayloadFetcher({
    onData: ({
      payload,
      param,
    }: {
      payload: TestExecutionResult;
      param: string;
    }) => {
      if (validate(payload)) {
        handleDataChange(payload);
        setOrigin(param);
      } else {
        // eslint-disable-next-line no-console
        console.error('Invalid payload URL');
      }
    },
    onLoading: setLoading,
  });

  useEffect(() => {
    if (!queryParam) {
      setOrigin(null);
      handleDataChange(null);
    }
  }, [queryParam]); // eslint-disable-line

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="animate-spin" size="48" strokeWidth="1.5" />
      </div>
    );
  }

  if (origin) {
    return null;
  }

  return <JsonFileUpload onChange={handleFileChange} validate={validate} />;
}

export default PayloadHandler;
