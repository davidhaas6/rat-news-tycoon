import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '../../stores/useGame';
import PublishPanel from '../PublishPanel';
import { bus } from '../../utils/eventBus';
import { AnimatePresence, motion } from "motion/react";
import NewsDesk from '../NewsDesk';
import ViewShell from './ViewShell';
import ArticleView from './ArticleView';

type ScreenView =
  | { name: 'base' }
  | { name: 'publish'; draft?: any }
  | { name: 'employee'; id: string }
  | { name: 'article'; id: string }
  | { name: 'settings' };

export default function Screen() {
  const publishArticle = useGame(s => s.publishArticle);
  const [view, setView] = useState<ScreenView>({ name: 'base' });
  const openerRef = useRef<HTMLElement | null>(null);
  const writers = useGame(s => s.writers);
  const companyName = useGame(s => s.publicationName);

  useEffect(() => {
    // allow any part of the UI to open a named view via the bus
    const unsub = bus.on('openView', (v: any) => {
      // capture the element that currently has focus (the button that was clicked)
      console.log("opening view")
      openerRef.current = document.activeElement as HTMLElement | null;
      setView(v as ScreenView);
    });
    return unsub;
  }, []);

  function closeToBase() {
    setView({ name: 'base' });

    // restore focus to the element that opened the panel (if any)
    const opener = openerRef.current;
    if (opener && typeof (opener as HTMLElement).focus === 'function') {
      (opener as HTMLElement).focus();
    }
    openerRef.current = null;
  }

  function handlePublish(draft: any) {
    // forward to store action
    publishArticle(draft);
    closeToBase();
  }

  const title = `${companyName} Staff`;

  const currentKey = (() => {
    if (view.name === 'base') return 'view-base';
    if (view.name === 'publish') return `view-publish-${view.draft ? 'draft' : 'new'}`;
    if (view.name === 'employee') return `view-employee-${view.id}`;
    if (view.name === 'article') return `view-article-${view.id}`;
    return `view-${view.name}`;
  })();

  return (
    <section className="rounded-lg min-w-[320px] w-full h-full bg-stone-900 text-stone-100 p-4 mx-4 md:mx-0">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">{title}</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              // open publish view directly (keeps it local and simple)
              openerRef.current = document.activeElement as HTMLElement | null;
              setView({ name: 'publish' });
            }}
            className="px-3 py-2 bg-yellow-400 text-stone-900 rounded font-medium shadow"
          >
            New Article
          </button>
        </div>
      </div>



      <AnimatePresence>
        {view.name === 'publish' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", duration: 0.1 }}
            key={currentKey}
            className="mt-3"
          >
            <ViewShell onClose={closeToBase}>
              <PublishPanel
                onPublish={handlePublish}
                onClose={closeToBase}
              />
            </ViewShell>
          </motion.div>
        )}

        {view.name === 'employee' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ type: "spring", duration: 0.25 }}
            key={currentKey}
            className="mt-3"
          >
            <ViewShell onClose={closeToBase}>
              {/* Placeholder: swap in real EmployeeDetail component */}
              <div className="p-4">
                <h3 className="text-lg font-semibold">Employee: {view.id}</h3>
                <p className="text-sm text-stone-300">Employee details UI placeholder</p>
              </div>
            </ViewShell>
          </motion.div>
        )}

        {view.name === 'article' && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ type: "spring", duration: 0.25 }}
            key={currentKey}
            className="mt-3"
          >
            <ViewShell onClose={closeToBase}>
              <ArticleView id={view.id} />
            </ViewShell>
          </motion.div>
        )}

        {view.name === 'settings' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            key={currentKey}
            className="mt-3"
          >
            <ViewShell onClose={closeToBase}>
              {/* Placeholder: swap in real Settings component */}
              <div className="p-4">
                <h3 className="text-lg font-semibold">Settings</h3>
                <p className="text-sm text-stone-300">Settings UI placeholder</p>
              </div>
            </ViewShell>
          </motion.div>
        )}

        <div className="mt-3">
        </div>

        {view.name === 'base' &&
          // <motion.div
          //   // initial={{ opacity: 0, scale: 0.4 }}
          //   // animate={{ opacity: 1, scale: 1 }}
          //   // exit={{ opacity: 0, scale: 0.4 }}
          //   // transition={{ duration: 0.3 }}
          //   key={currentKey}
          //   className="mt-3"
          // >
            writers.map((w) => <NewsDesk key={w.id} writer={w} />)
          // </motion.div>
        }
      </AnimatePresence>



    </section>
  );
}
