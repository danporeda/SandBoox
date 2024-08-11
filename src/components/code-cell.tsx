import './code-cell.css';
import { useEffect } from 'react';
import CodeEditor from './code-editor';
import Preview from './preview';
import Resizable from './resizable';
import { Cell } from '../state';
import { useActions } from '../hooks/use-actions';
import { useTypedSelector } from '../hooks/use-typed-selector';

interface CodeCellProps {
  cell: Cell
}

const CodeCell: React.FC<CodeCellProps> = ({ cell }) => {
  const { updateCell, createBundle } = useActions();
  const bundle = useTypedSelector((state) => state.bundles[cell.id])
  const cumulativeCode = useTypedSelector((state) => {
    const { data, order } = state.cells;

    const codeCells = order.filter((cellId) => data[cellId].type === 'code');
    const cumulativeCode = [
      `
        import _React from 'react';
        import _ReactDOM from 'react-dom';
        const show = (value) => {
          const root = document.querySelector('#root');

          if (typeof value === 'object') {
            if (value.$$typeof && value.props) {
              _ReactDOM.render(value, root);
            } else {
              root.innerHTML = JSON.stringify(value);
            }
          } else {
            root.innerHTML = value;
          }
        };
      `,
    ];
    for (let c of codeCells) {
      cumulativeCode.push(data[c].content);
      if (c === cell.id) {
        break;
      }
    }

    return cumulativeCode;
  })

  useEffect(() => {
    if (!bundle) {
      createBundle(cell.id, cumulativeCode.join('\n'));
      return;
    }

    const timeout = setTimeout(async () => {
      createBundle(cell.id, cumulativeCode.join('\n'))
    }, 1000);

    return () => {
      clearTimeout(timeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cumulativeCode.join('\n'), cell.id, createBundle])

  return (
    <Resizable direction="vertical">
      <div style={{ height: 'calc(100% - 8px)', display: 'flex', flexDirection: 'row' }}>
        <Resizable direction="horizontal">
        <CodeEditor 
          initialValue={cell.content}
          onChange={(value) => updateCell(cell.id, value)} 
        />
        </Resizable>
        <div className="progress-wrapper">
          {!bundle || bundle.loading ? (
            <div className="progress-cover">
              <progress className="progress is-small is-primary" max="100">
                Loading
              </progress>
            </div>
          ) : (
            <Preview code={bundle.code} err={bundle.err} />
          )}
        </div>
      </div>
    </Resizable>
  );
};

export default CodeCell;