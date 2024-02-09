import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { useToast } from '@/components/ui/useToast';
import { useCypressEventsContext } from '@/context/cypressEvents';
import { useHttpArchiveContext } from '@/context/httpArchiveEntries';
import { useReplayerContext } from '@/context/replayer';
import { usePayloadQueryParam } from '@/hooks/useQuery';
import { testStateVariants } from '@/lib/testState';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import Console from './Console';
import CyEvents from './CyEvents';
import DarkModeToggle from './DarkModeToggle';
import { EventDetails } from './EventDetails';
import Network from './Network';
import PayloadHandler from './PayloadHandler';
import Player from './Player';
import { Button } from './ui/Button';
import { Modal } from './ui/Modal';

function GridLayout() {
  const { toast } = useToast();

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [, setInputValue] = useState('');

  const handleShowModal = () => {
    setInputValue(localStorage.getItem('filepathPrefix') ?? '');
    setShowModal(!showModal);
  };

  const handleModalClose = () => {
    setShowModal(false);
  };

  const handleModalSave = (value: string) => {
    setInputValue(value);

    localStorage.setItem('filepathPrefix', value);
    setShowModal(false);

    toast({
      title: 'Settings saved',
    });
  };

  const {
    events,
    selectedEvent,
    selectedEventObject,
    setSelectedEvent,
    meta,
    browserLogs,
    setEvents,
    setMeta,
    setBrowserLogs,
  } = useCypressEventsContext();
  const { origin, setOrigin, setReplayerData } = useReplayerContext();
  const { entries, setHttpArchiveLog } = useHttpArchiveContext();
  const [, , clearQueryParam] = usePayloadQueryParam();

  const logsCount =
    (browserLogs?.logEntry.length ?? 0) +
    (browserLogs?.runtimeConsoleApiCalled.length ?? 0);

  const handleClick = () => {
    setOrigin(null);
    setEvents([]);
    setReplayerData([]);
    setHttpArchiveLog(null);
    setMeta(null);
    setBrowserLogs(null);
    clearQueryParam();
  };

  const handleCopySpecNameToClipboard = async () => {
    if (!meta) return;
    await navigator.clipboard.writeText(meta.spec);

    toast({
      title: 'Filename copied to clipboard',
    });
  };

  const handleOpenInVsCode = async (absoluteFile: string) => {
    if (!absoluteFile) return;

    const filepathPrefix = localStorage.getItem('filepathPrefix') ?? 'c:/git';
    const vscodeUri = `vscode://file/${filepathPrefix}/${absoluteFile}`;

    window.open(vscodeUri, '_blank');
  };

  return (
    <>
      <div className="absolute top-5 right-8 z-10">
        <DarkModeToggle />
        <Button
          onClick={handleShowModal}
          className="m-0 p-0 bg-transparent hover:bg-transparent hover:text-amber-700 text-slate-500"
        >
          <svg
            id="vs_setting_svg"
            xmlns="http://www.w3.org/2000/svg"
            className="icon icon-tabler icon-tabler-setting"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M10.325 4.317c.426 -1.756 2.924 -1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543 -.94 3.31 .826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756 .426 1.756 2.924 0 3.35a1.724 1.724 0 0 0 -1.066 2.573c.94 1.543 -.826 3.31 -2.37 2.37a1.724 1.724 0 0 0 -2.572 1.065c-.426 1.756 -2.924 1.756 -3.35 0a1.724 1.724 0 0 0 -2.573 -1.066c-1.543 .94 -3.31 -.826 -2.37 -2.37a1.724 1.724 0 0 0 -1.065 -2.572c-1.756 -.426 -1.756 -2.924 0 -3.35a1.724 1.724 0 0 0 1.066 -2.573c-.94 -1.543 .826 -3.31 2.37 -2.37c1 .608 2.296 .07 2.572 -1.065z" />
            <path d="M9 12a3 3 0 1 0 6 0a3 3 0 0 0 -6 0" />
          </svg>
        </Button>
      </div>

      <Modal
        showModal={showModal}
        onClose={handleModalClose}
        onSave={handleModalSave}
      />

      {!origin && (
        <div className="w-screen h-screen flex items-center justify-center">
          <div className="h-96 w-[70%]">
            <div className="m-auto w-full p-3 text-center">
              <a
                href="https://github.com/currents-dev/cypress-debugger"
                target="_blank"
              >
                Cypress Debugger
              </a>{' '}
              by{' '}
              <a
                href="https://currents.dev?utm_source=cypress-debugger"
                target="_blank"
              >
                Currents.dev
                <div>&</div>
                <div className="text-amber-500 animate-bounce">BugBusters</div>
              </a>
            </div>
            <PayloadHandler />
            <div className="m-auto w-full p-3 text-center">
              Web player for traces generated by{' '}
              <a href="https://github.com/currents-dev/cypress-debugger">
                cypress-debugger
              </a>{' '}
              plugin. All the data is stored in-browser.
              <br />
              The project is not affiliated with Cypress.io, Inc.
            </div>
          </div>
        </div>
      )}
      {!!origin && (
        <div className="">
          <div className="relative flex items-center justify-center h-20 border-b border-slate-300 dark:border-slate-700">
            <p className="px-6">
              <span>Payload from:</span> <span>{origin}</span>
            </p>
            <Button className="px-6 h-9 rounded border" onClick={handleClick}>
              Remove
            </Button>
          </div>
          {events.length > 0 && (
            <div className="w-full grid grid-cols-[2fr_7fr_3fr] h-[calc(100vh-5rem)] divide-x divide-slate-300 dark:divide-slate-700">
              <div>
                {meta && (
                  <div className="p-4 border-b">
                    <div className="flex flex-row gap-2 justify-between items-center">
                      <div className="text-amber-700 dark:text-amber-500 font-semibold">
                        {meta?.spec}
                      </div>

                      <div className="flex flex-row gap-2">
                        <Button
                          onClick={() => handleOpenInVsCode(meta.absoluteFile)}
                          className="m-0 p-0 bg-transparent hover:bg-transparent hover:text-amber-700 text-slate-500"
                        >
                          <svg
                            id="vs_code_svg"
                            xmlns="http://www.w3.org/2000/svg"
                            className="icon icon-tabler icon-tabler-brand-vscode"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                            <path d="M16 3v18l4 -2.5v-13z" />
                            <path d="M9.165 13.903l-4.165 3.597l-2 -1l4.333 -4.5m1.735 -1.802l6.932 -7.198v5l-4.795 4.141" />
                            <path d="M16 16.5l-11 -10l-2 1l13 13.5" />
                          </svg>
                        </Button>

                        <Button
                          onClick={handleCopySpecNameToClipboard}
                          className="m-0 p-0 bg-transparent hover:bg-transparent hover:text-amber-700 text-slate-500"
                        >
                          <svg
                            id="vs_code_svg"
                            xmlns="http://www.w3.org/2000/svg"
                            className="icon icon-tabler icon-tabler-brand-vscode"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                            <path d="M9 5h-2a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-12a2 2 0 0 0 -2 -2h-2" />
                            <path d="M9 3m0 2a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v0a2 2 0 0 1 -2 2h-2a2 2 0 0 1 -2 -2z" />
                          </svg>
                        </Button>
                      </div>
                    </div>
                    <div className="font-base">{meta?.test.join(' > ')}</div>
                    <div className="font-base">
                      <strong>state</strong>:{' '}
                      <span
                        className={cn(
                          testStateVariants({
                            state: meta.state,
                          })
                        )}
                      >
                        {' '}
                        {meta.state}
                      </span>
                    </div>
                    {meta.retryAttempt > 0 && (
                      <div className="font-thin">
                        attempt: {meta.retryAttempt + 1}
                      </div>
                    )}
                  </div>
                )}
                <Tabs defaultValue="steps" className="w-[400px]">
                  <TabsList>
                    <TabsTrigger value="steps">Steps</TabsTrigger>
                  </TabsList>
                  <TabsContent value="steps">
                    <CyEvents
                      events={events}
                      selectedEvent={selectedEvent}
                      setSelectedEvent={setSelectedEvent}
                    />
                  </TabsContent>
                </Tabs>
              </div>
              <div className="flex items-center justify-center">
                <Player />
              </div>
              <div className="min-w-full">
                <Tabs defaultValue="details">
                  <TabsList>
                    <TabsTrigger value="details">Step Details</TabsTrigger>
                    <TabsTrigger value="network">
                      Network{' '}
                      {entries.length > 0 ? (
                        <sup className="text-emerald-700 dark:text-emerald-500">
                          {entries.length}
                        </sup>
                      ) : (
                        ''
                      )}
                    </TabsTrigger>
                    <TabsTrigger value="console">
                      Console{' '}
                      {logsCount > 0 ? (
                        <sup className="text-emerald-700 dark:text-emerald-500">
                          {logsCount}
                        </sup>
                      ) : (
                        ''
                      )}
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="details">
                    <EventDetails event={selectedEventObject} />
                  </TabsContent>
                  <TabsContent value="network">
                    <Network entries={entries} />
                  </TabsContent>
                  <TabsContent value="console">
                    <Console logs={browserLogs} />
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}

export default GridLayout;
