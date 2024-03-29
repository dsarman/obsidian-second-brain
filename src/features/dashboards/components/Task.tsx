import * as React from 'react';
import { useCallback, useMemo, useState } from 'react';
import { ITask } from 'features/graph/graphTypes';
import { Task as TaskObj } from 'features/tasks/Task';
import { useAtomValue } from 'jotai';
import { dvApiAtom } from 'common/state';
import { css } from '@emotion/react';
import { TFile } from 'obsidian';
import { BlockComponent } from 'features/dashboards/components/BlockComponent';
import { NEWLINE } from 'common/utilities';

interface Props {
  task: ITask;
}

const taskContainer = css({
  flexDirection: 'row',
  paddingTop: 10,
  paddingInlineStart: 10,
});

export const Task = ({ task }: Props) => {
  const dvApi = useAtomValue(dvApiAtom);

  const [line, setLine] = useState<string | null>(null);

  const taskObj = useMemo(() => {
    if (!dvApi) return null;
    return TaskObj.fromLine(
      line ?? `${task.data.checked ? '- [x] ' : '- [ ] '}${task.data.text}`,
      dvApi.app.vault,
      task.data
    );
  }, [dvApi, line, task.data.checked, task.data.text]);

  const onChange = useCallback(() => {
    const async = async () => {
      if (!dvApi) return;
      const file = dvApi.app.vault.getAbstractFileByPath(task.data.path);
      if (file instanceof TFile && taskObj) {
        const newTask = await taskObj.toggle();
        const newLine = newTask.line();
        setLine(taskObj.line());
        const content = (await dvApi.app.vault.read(file)).split(NEWLINE);
        content[task.data.line] = newLine;
        await dvApi.app.vault.modify(file, content.join(NEWLINE));
      }
    };

    async();
  }, [dvApi, task.data.line, task.data.path, taskObj]);

  return (
    <div css={taskContainer}>
      {taskObj?.getBlocks().map((block, index) => (
        <BlockComponent key={index} block={block} onCheckboxChange={onChange} />
      ))}
      <br />
    </div>
  );
};
