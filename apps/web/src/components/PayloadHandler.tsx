import { useCypressEventsContext } from '@/context/cypressEvents';
import { useHttpArchiveContext } from '@/context/httpArchiveEntries';
import { useReplayerContext } from '@/context/replayer';
import {
  useCiPathPrefixQueryParam,
  usePayloadQueryParam,
} from '@/hooks/useQuery';
import { TestExecutionResult } from 'cypress-debugger';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import usePayloadFetcher from '../hooks/usePayloadFetcher';
import JsonFileUpload from './JsonFileUpload';

function extractPath(
  queryCiPathPrefixParam: string | null,
  agentPath: string | null
) {
  if (!agentPath) {
    return '';
  }

  return agentPath.replace(queryCiPathPrefixParam ?? '', '');
}

function PayloadHandler() {
  const [loading, setLoading] = useState(false);

  const { origin, setOrigin, setReplayerData } = useReplayerContext();

  const { setHttpArchiveLog } = useHttpArchiveContext();

  const { setEvents, setMeta, setBrowserLogs } = useCypressEventsContext();

  const [queryParam] = usePayloadQueryParam();
  const [queryCiPathPrefixParam] = useCiPathPrefixQueryParam();

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
    const lineNumber: number =
      parsedStack?.find((item: { line: number }) => item.line)?.line ?? 1;

    const colNumber: number =
      parsedStack?.find((item: { column: number }) => item.column)?.column ?? 1;

    const absoluteFilePath =
      extractPath(queryCiPathPrefixParam, absoluteFile) ?? '';

    setMeta(
      payload?.meta
        ? {
            ...payload.meta,
            absoluteFile: absoluteFilePath,
            lineNumber,
            colNumber,
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
